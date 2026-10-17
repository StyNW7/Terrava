"""Terra: the Terrava assistant.

Online mode uses Claude (Anthropic API) with Terrava's tools: knowledge search,
the health model, the heat-stress calculator and the caller's farm data.
Offline mode (no ANTHROPIC_API_KEY) answers from the same tools and knowledge
base with templated responses, so the chatbot always works.

Responses are streamed as small JSON events:
  {"type": "text", "delta": "..."}     answer text
  {"type": "tool", "name": "..."}      a tool is being used (for a "thinking..." chip)
  {"type": "done", "mode": "...", ...} end of the answer with usage info
  {"type": "error", "message": "..."}  something went wrong
"""

from __future__ import annotations

import json
import logging
import re
from collections.abc import AsyncIterator
from typing import Any

import anthropic

from ..config import Settings
from ..ml.registry import ModelRegistry
from .retriever import get_knowledge_base
from .tools import TOOLS, ToolError, run_tool

log = logging.getLogger("terrava.chat")

SYSTEM_PROMPT = """You are Terra, the AI assistant inside Terrava, a smart livestock platform used by Indonesian farmers, cooperatives and veterinarians. Terrava fits cattle with smart ear tags that measure body temperature, heart rate, oxygen saturation, activity and GPS location, sends the data over LoRa to the cloud, and turns it into health scores, alerts, AI insights and reports.

How to help:
- Answer in the user's language. Default to Indonesian (Bahasa Indonesia) when unsure; switch to English if the user writes in English. Use plain words a farmer understands and explain technical terms briefly.
- Ground health and product answers in Terrava's tools. Use search_knowledge for veterinary facts and how the dashboard works, assess_vitals whenever the user gives vital signs, heat_stress when they mention weather, temperature and humidity, and get_animal / list_alerts when they ask about their own animals or alerts. Do not invent readings or animals that the tools did not return.
- Be practical: lead with what the farmer should do now, then why. Short paragraphs or a few bullet points; no long essays.
- Safety: you support, but do not replace, a veterinarian. When signs are urgent (body temperature 40.5 °C or higher, laboured breathing, an animal down and unable to stand, heavy bleeding, suspected FMD / PMK or anthrax, sudden deaths) tell the user to contact a veterinarian or the local animal health centre (puskeswan) right away. Notifiable diseases such as FMD (PMK), LSD and anthrax must be reported to the local livestock office. Never prescribe prescription drugs or doses; antibiotics need a veterinary prescription and have milk and meat withdrawal periods.
- If a question is outside livestock farming and the Terrava platform, say briefly that you focus on livestock care and Terrava, then offer related help.
"""

EVENT = dict[str, Any]


def _language(text: str, preferred: str | None) -> str:
    if preferred in ("id", "en"):
        return preferred
    words = re.findall(r"[a-zA-Z]+", text.lower())
    id_hits = sum(w in {"yang", "dan", "apa", "bagaimana", "sapi", "ternak", "saya", "ini", "itu", "suhu", "tidak", "kenapa", "berapa"} for w in words)
    en_hits = sum(w in {"the", "and", "what", "how", "cow", "cattle", "my", "is", "why", "temperature", "should"} for w in words)
    return "en" if en_hits > id_hits else "id"


class TerraAssistant:
    def __init__(self, settings: Settings, registry: ModelRegistry):
        self.settings = settings
        self.registry = registry
        self.client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key) if settings.anthropic_api_key else None

    @property
    def mode(self) -> str:
        return "claude" if self.client else "offline"

    async def stream(self, messages: list[dict], language: str | None = None, context: dict | None = None) -> AsyncIterator[EVENT]:
        last_user = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
        lang = _language(last_user, language)
        if self.client is None:
            async for event in self._offline(last_user, lang, context):
                yield event
            return
        async for event in self._claude(messages, lang, context):
            yield event

    # ------------------------------------------------------------------
    # Claude (online)
    # ------------------------------------------------------------------

    async def _claude(self, messages: list[dict], lang: str, context: dict | None) -> AsyncIterator[EVENT]:
        assert self.client is not None
        # Stable instructions first (cached); per-request farm context after the cache breakpoint.
        system: list[dict[str, Any]] = [{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}]
        farm_summary = _summarize_context(context)
        system.append({"type": "text", "text": f"Preferred answer language: {'Indonesian' if lang == 'id' else 'English'}.\n{farm_summary}"})

        history: list[dict[str, Any]] = [{"role": m["role"], "content": m["content"]} for m in messages if m["role"] in ("user", "assistant")]
        usage = {"input_tokens": 0, "output_tokens": 0, "cache_read_input_tokens": 0}
        model_used = self.settings.llm_model
        json_retries = 0
        rounds = 0

        while rounds < self.settings.llm_max_tool_rounds:
            rounds += 1
            try:
                async with self.client.beta.messages.stream(
                    model=self.settings.llm_model,
                    max_tokens=self.settings.llm_max_tokens,
                    system=system,
                    tools=TOOLS,
                    messages=history,
                    output_config={"effort": self.settings.llm_effort},
                    # Server-side fallback keeps the conversation going if a request is declined.
                    betas=["server-side-fallback-2026-07-01"],
                    fallbacks="default",
                ) as stream:
                    async for event in stream:
                        if event.type == "text":
                            yield {"type": "text", "delta": event.text}
                    final = await stream.get_final_message()
                json_retries = 0
            except ValueError:
                # A streamed tool input could not be parsed at all; re-issue the turn (bounded).
                json_retries += 1
                if json_retries > 2:
                    yield {"type": "error", "message": "The assistant produced an unreadable tool call. Please try again."}
                    return
                continue
            except anthropic.AuthenticationError:
                yield {"type": "error", "message": "The Anthropic API key is invalid. Check ANTHROPIC_API_KEY."}
                return
            except anthropic.RateLimitError:
                yield {"type": "error", "message": "The assistant is busy (rate limited). Please try again in a moment."}
                return
            except anthropic.APIStatusError as error:
                log.error("Claude API error %s: %s", error.status_code, error.message)
                yield {"type": "error", "message": "The assistant is temporarily unavailable. Please try again."}
                return
            except anthropic.APIConnectionError:
                yield {"type": "error", "message": "Could not reach the Anthropic API. Check the network connection."}
                return

            model_used = final.model
            for key in usage:
                usage[key] += getattr(final.usage, key, 0) or 0
            history.append({"role": "assistant", "content": final.content})

            if final.stop_reason == "refusal":
                yield {"type": "text", "delta": "\n\n" + ("Maaf, saya tidak dapat membantu permintaan tersebut." if lang == "id" else "Sorry, I can't help with that request.")}
                break
            if final.stop_reason == "pause_turn":
                continue
            tool_uses = [block for block in final.content if block.type == "tool_use"]
            if not tool_uses:
                break
            if final.stop_reason == "max_tokens":
                # A truncated tool input parses as a partial object; never run it.
                yield {"type": "error", "message": "The answer was cut off. Please ask a shorter question."}
                break

            results = []
            for block in tool_uses:
                yield {"type": "tool", "name": block.name}
                try:
                    content = run_tool(block.name, block.input, self.registry, context)
                    results.append({"type": "tool_result", "tool_use_id": block.id, "content": content})
                except ToolError as error:
                    results.append({"type": "tool_result", "tool_use_id": block.id, "content": str(error), "is_error": True})
                except Exception as error:  # surface unexpected tool failures to the model, not the user
                    log.exception("Tool %s failed", block.name)
                    results.append({"type": "tool_result", "tool_use_id": block.id, "content": f"Tool failed: {error}", "is_error": True})
            history.append({"role": "user", "content": results})

        yield {"type": "done", "mode": "claude", "model": model_used, "usage": usage}

    # ------------------------------------------------------------------
    # Offline mode
    # ------------------------------------------------------------------

    async def _offline(self, question: str, lang: str, context: dict | None) -> AsyncIterator[EVENT]:
        text = question.lower().replace(",", ".")
        parts: list[str] = []
        tools_used: list[str] = []

        temperature = _find_number(text, [r"(\d{2}(?:\.\d+)?)\s*°?\s*c\b", r"(?:suhu|temperature|temp)\D{0,12}(\d{2}(?:\.\d+)?)"], 30, 45)
        heart = _find_number(text, [r"(\d{2,3})\s*bpm", r"(?:detak|jantung|heart\s*rate|hr)\D{0,12}(\d{2,3})"], 20, 220)
        oxygen = _find_number(text, [r"(?:spo2|oksigen|oxygen)\D{0,12}(\d{2,3})"], 50, 100)
        humidity = _find_number(text, [r"(?:kelembapan|kelembaban|humidity|rh)\D{0,12}(\d{1,3})"], 0, 100)
        animal_code = re.search(r"\b(trv-\d{3}|lvs-\d{3}|ear-\d{4})\b", text)

        if animal_code and context:
            yield {"type": "tool", "name": "get_animal"}
            tools_used.append("get_animal")
            found = json.loads(run_tool("get_animal", {"query": animal_code.group(1)}, self.registry, context))
            if found.get("found"):
                a = found["animal"]
                parts.append(
                    (f"**{a.get('name')} ({a.get('code')})** — status {a.get('healthStatus')}, skor {a.get('healthScore')}. "
                     f"Suhu {a.get('temperature')} °C, detak {a.get('heartRate')} bpm, aktivitas {a.get('activityLevel')}.")
                    if lang == "id"
                    else (f"**{a.get('name')} ({a.get('code')})** — status {a.get('healthStatus')}, score {a.get('healthScore')}. "
                          f"Temperature {a.get('temperature')} °C, heart rate {a.get('heartRate')} bpm, activity {a.get('activityLevel')}.")
                )
                temperature = temperature or a.get("temperature")
                heart = heart or a.get("heartRate")
                oxygen = oxygen or a.get("oxygenLevel")

        if temperature is not None and humidity is not None and any(w in text for w in ("thi", "panas", "heat", "cuaca", "weather", "kandang", "barn")):
            yield {"type": "tool", "name": "heat_stress"}
            tools_used.append("heat_stress")
            heat = json.loads(run_tool("heat_stress", {"temperature": temperature, "humidity": humidity}, self.registry, context))
            band = {"normal": ("normal", "normal"), "mild": ("ringan", "mild"), "moderate": ("sedang", "moderate"), "severe": ("berat", "severe")}[heat["band"]]
            parts.append(
                (f"THI saat ini **{heat['thi']}** (risiko heat stress {band[0]}). Estimasi kehilangan susu ±{heat['estimatedMilkLossKgPerCowPerDay']} kg/ekor/hari.\n"
                 + "\n".join(f"- {a['id']}" for a in heat["actions"]))
                if lang == "id"
                else (f"Current THI is **{heat['thi']}** ({band[1]} heat-stress risk). Estimated milk loss ±{heat['estimatedMilkLossKgPerCowPerDay']} kg/cow/day.\n"
                      + "\n".join(f"- {a['en']}" for a in heat["actions"]))
            )
        elif temperature is not None and heart is not None:
            yield {"type": "tool", "name": "assess_vitals"}
            tools_used.append("assess_vitals")
            result = json.loads(
                run_tool("assess_vitals", {"temperature": [temperature], "heartRate": [heart], **({"oxygen": [oxygen]} if oxygen else {})}, self.registry, context)
            )
            top = result["primaryCondition"]
            status = {"healthy": ("Sehat", "Healthy"), "attention": ("Perlu perhatian", "Needs attention"), "critical": ("Kritis", "Critical")}[result["status"]]
            actions = ", ".join(result["recommendations"]) or ("lanjutkan pemantauan rutin" if lang == "id" else "continue routine monitoring")
            parts.append(
                (f"Hasil model kesehatan Terrava: skor **{result['healthScore']}/100** ({status[0]}). "
                 f"Kemungkinan terbesar: **{top['name']['id']}** ({round(top['probability'] * 100)}%). {result['cause']['id']}\n"
                 f"Tindakan yang disarankan: {actions}.")
                if lang == "id"
                else (f"Terrava health model: score **{result['healthScore']}/100** ({status[1]}). "
                      f"Most likely: **{top['name']['en']}** ({round(top['probability'] * 100)}%). {result['cause']['en']}\n"
                      f"Recommended actions: {actions}.")
            )

        yield {"type": "tool", "name": "search_knowledge"}
        tools_used.append("search_knowledge")
        hits = get_knowledge_base().search(question, k=2)
        if hits:
            snippet = _paragraph_in_language(hits[0]["text"], lang)
            parts.append(f"{snippet}\n\n_{'Sumber' if lang == 'id' else 'Source'}: {hits[0]['title']}_")
        elif not parts:
            parts.append(
                "Saya Terra, asisten Terrava. Saya bisa membantu soal kesehatan sapi, heat stress, vaksinasi, birahi, perangkat ear tag, dan cara memakai dashboard Terrava."
                if lang == "id"
                else "I'm Terra, the Terrava assistant. I can help with cattle health, heat stress, vaccination, estrus, ear tag devices and using the Terrava dashboard."
            )

        if temperature is not None and temperature >= 40.5:
            parts.append(
                "⚠️ Suhu ≥ 40,5 °C termasuk darurat: segera hubungi dokter hewan atau puskeswan."
                if lang == "id"
                else "⚠️ A temperature of 40.5 °C or more is an emergency: contact a veterinarian right away."
            )
        parts.append(
            "_Mode offline: jawaban dari basis pengetahuan dan model Terrava. Atur ANTHROPIC_API_KEY untuk percakapan penuh._"
            if lang == "id"
            else "_Offline mode: answered from Terrava's knowledge base and models. Set ANTHROPIC_API_KEY for full conversations._"
        )

        answer = "\n\n".join(parts)
        for chunk in re.findall(r"\S+\s*", answer):
            yield {"type": "text", "delta": chunk}
        yield {"type": "done", "mode": "offline", "toolsUsed": tools_used}


def _find_number(text: str, patterns: list[str], low: float, high: float) -> float | None:
    for pattern in patterns:
        for match in re.finditer(pattern, text):
            value = float(match.group(1))
            if low <= value <= high:
                return value
    return None


def _paragraph_in_language(text: str, lang: str) -> str:
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    id_words = {"dan", "yang", "untuk", "dengan", "atau", "pada", "ternak", "sapi", "bila", "di"}
    en_words = {"and", "the", "for", "with", "or", "on", "animal", "cattle", "if", "in"}

    def score(paragraph: str) -> int:
        words = re.findall(r"[a-zA-Z]+", paragraph.lower())
        hits_id = sum(w in id_words for w in words)
        hits_en = sum(w in en_words for w in words)
        return hits_id - hits_en if lang == "id" else hits_en - hits_id

    best = max(paragraphs, key=score) if paragraphs else text
    return best


def _summarize_context(context: dict | None) -> str:
    if not context:
        return "No farm data was provided with this conversation; answer generally and ask for details if needed."
    lines = ["Farm data provided by the Terrava dashboard (use get_animal / list_alerts for details):"]
    if context.get("farmName"):
        lines.append(f"- Organization: {context['farmName']}")
    animals = context.get("animals", [])
    if animals:
        counts: dict[str, int] = {}
        for a in animals:
            counts[str(a.get("healthStatus", "unknown"))] = counts.get(str(a.get("healthStatus", "unknown")), 0) + 1
        lines.append(f"- {len(animals)} animals: " + ", ".join(f"{k} {v}" for k, v in sorted(counts.items())))
    alerts = context.get("alerts", [])
    if alerts:
        active = [a for a in alerts if a.get("status") != "resolved"]
        lines.append(f"- {len(active)} open alerts ({sum(1 for a in active if a.get('severity') == 'critical')} critical)")
    return "\n".join(lines)
