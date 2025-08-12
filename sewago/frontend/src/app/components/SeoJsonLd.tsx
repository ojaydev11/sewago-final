"use client";
import React from "react";

type JsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
};

export function SeoJsonLd({ data }: JsonLdProps) {
  const json = Array.isArray(data) ? data : [data];
  return json.map((obj, idx) => (
    <script
      key={idx}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
    />
  ));
}


