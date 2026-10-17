"""Lightweight retrieval over the bilingual knowledge base (no external services).

Documents are split at `##` headings; each section is indexed with TF-IDF
(word unigrams + bigrams and character n-grams so Indonesian affixes and typos
still match). Good enough for a few hundred sections; swap for a vector store
when the knowledge base grows.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import FeatureUnion

KNOWLEDGE_DIR = Path(__file__).resolve().parent / "knowledge"


@dataclass(frozen=True)
class Passage:
    id: str
    source: str
    title: str
    text: str


def load_passages(directory: Path = KNOWLEDGE_DIR) -> list[Passage]:
    passages: list[Passage] = []
    for path in sorted(directory.glob("*.md")):
        content = path.read_text(encoding="utf-8")
        doc_title = re.search(r"^# (.+)$", content, re.MULTILINE)
        sections = re.split(r"^## ", content, flags=re.MULTILINE)[1:]
        for index, section in enumerate(sections):
            heading, _, body = section.partition("\n")
            passages.append(
                Passage(
                    id=f"{path.stem}#{index}",
                    source=path.name,
                    title=f"{doc_title.group(1) if doc_title else path.stem} — {heading.strip()}",
                    text=body.strip(),
                )
            )
    return passages


class KnowledgeBase:
    def __init__(self, passages: list[Passage]):
        self.passages = passages
        self.vectorizer = FeatureUnion(
            [
                ("words", TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True, strip_accents="unicode", lowercase=True)),
                ("chars", TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 5), sublinear_tf=True, lowercase=True)),
            ]
        )
        corpus = [f"{p.title}\n{p.text}" for p in passages]
        self.matrix = self.vectorizer.fit_transform(corpus)

    def search(self, query: str, k: int = 4, min_score: float = 0.05) -> list[dict]:
        if not query.strip():
            return []
        q = self.vectorizer.transform([query])
        scores = (self.matrix @ q.T).toarray().ravel()
        order = np.argsort(-scores)[:k]
        return [
            {"id": self.passages[i].id, "title": self.passages[i].title, "source": self.passages[i].source, "score": round(float(scores[i]), 3), "text": self.passages[i].text}
            for i in order
            if scores[i] >= min_score
        ]


@lru_cache
def get_knowledge_base() -> KnowledgeBase:
    return KnowledgeBase(load_passages())
