"""Exercise the Claude tool-use loop with a fake client (no network, no API key)."""

import asyncio
from types import SimpleNamespace

from terrava_ai.chat.assistant import TerraAssistant
from terrava_ai.config import Settings


class FakeStream:
    def __init__(self, text_chunks, final):
        self.text_chunks = text_chunks
        self.final = final

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False

    def __aiter__(self):
        async def gen():
            for chunk in self.text_chunks:
                yield SimpleNamespace(type="text", text=chunk)

        return gen()

    async def get_final_message(self):
        return self.final


class FakeMessages:
    def __init__(self, turns):
        self.turns = turns
        self.calls = []

    def stream(self, **kwargs):
        # Snapshot the history, as the real SDK serialises it at call time.
        self.calls.append({**kwargs, "messages": list(kwargs["messages"])})
        return self.turns.pop(0)


def usage():
    return SimpleNamespace(input_tokens=100, output_tokens=20, cache_read_input_tokens=80)


def test_tool_loop_runs_tools_and_returns_answer(models_dir):
    tool_turn = FakeStream(
        ["Let me check. "],
        SimpleNamespace(
            stop_reason="tool_use",
            model="claude-opus-5-5",
            usage=usage(),
            content=[
                SimpleNamespace(type="text", text="Let me check. "),
                SimpleNamespace(type="tool_use", id="toolu_1", name="heat_stress", input={"temperature": 33, "humidity": 80}),
            ],
        ),
    )
    answer_turn = FakeStream(
        ["THI is high, ", "cool the barn."],
        SimpleNamespace(stop_reason="end_turn", model="claude-opus-5-5", usage=usage(), content=[SimpleNamespace(type="text", text="THI is high, cool the barn.")]),
    )
    from terrava_ai.ml.registry import ModelRegistry

    assistant = TerraAssistant(Settings(anthropic_api_key=None), ModelRegistry(models_dir, n_samples=4000, seed=1))
    fake = FakeMessages([tool_turn, answer_turn])
    assistant.client = SimpleNamespace(beta=SimpleNamespace(messages=fake))

    async def collect():
        return [e async for e in assistant.stream([{"role": "user", "content": "Is 33C and 80% humidity dangerous?"}], "en")]

    events = asyncio.run(collect())
    text = "".join(e["delta"] for e in events if e["type"] == "text")
    assert text == "Let me check. THI is high, cool the barn."
    assert [e["name"] for e in events if e["type"] == "tool"] == ["heat_stress"]
    done = events[-1]
    assert done["type"] == "done" and done["usage"]["input_tokens"] == 200

    # Second request carries the assistant turn and the tool result back.
    second = fake.calls[1]["messages"]
    assert second[-2]["role"] == "assistant"
    tool_result = second[-1]["content"][0]
    assert tool_result["type"] == "tool_result" and tool_result["tool_use_id"] == "toolu_1"
    assert '"thi"' in tool_result["content"]
    # Request shape: cached system prompt, effort, server-side fallback.
    first = fake.calls[0]
    assert first["system"][0]["cache_control"] == {"type": "ephemeral"}
    assert first["fallbacks"] == "default"
    assert "server-side-fallback-2026-07-01" in first["betas"]
    assert all(tool["eager_input_streaming"] for tool in first["tools"])


def test_invalid_tool_input_is_returned_as_error(models_dir):
    bad_turn = FakeStream(
        [],
        SimpleNamespace(
            stop_reason="tool_use",
            model="m",
            usage=usage(),
            content=[SimpleNamespace(type="tool_use", id="toolu_2", name="heat_stress", input={"temperature": "hot"})],
        ),
    )
    final_turn = FakeStream(["ok"], SimpleNamespace(stop_reason="end_turn", model="m", usage=usage(), content=[SimpleNamespace(type="text", text="ok")]))
    from terrava_ai.ml.registry import ModelRegistry

    assistant = TerraAssistant(Settings(anthropic_api_key=None), ModelRegistry(models_dir, n_samples=4000, seed=1))
    fake = FakeMessages([bad_turn, final_turn])
    assistant.client = SimpleNamespace(beta=SimpleNamespace(messages=fake))

    async def collect():
        return [e async for e in assistant.stream([{"role": "user", "content": "x"}], "en")]

    asyncio.run(collect())
    result = fake.calls[1]["messages"][-1]["content"][0]
    assert result["is_error"] is True
