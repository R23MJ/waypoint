"use client";

import { useState } from "react";
import { Resource, ResourceType } from "@/lib/types";
import { X } from "lucide-react";

export function typeIcon(t: ResourceType): string {
  return { link: "\ud83d\udd17", note: "\ud83d\udcdd", book: "\ud83d\udcd5", video: "\ud83c\udfac", article: "\ud83d\udcf0" }[t];
}

export function ResourceChip({ resource, onDelete }: { resource: Resource; onDelete: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11.5px] bg-surface-2 border border-border-soft rounded-md px-2 py-1 text-text-dim max-w-[260px]">
      {resource.url ? (
        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="truncate hover:text-amber">
          {typeIcon(resource.type)} {resource.title}
        </a>
      ) : (
        <span className="truncate">
          {typeIcon(resource.type)} {resource.title}
        </span>
      )}
      <button onClick={onDelete} className="text-text-faint hover:text-rust flex-shrink-0">
        <X size={11} />
      </button>
    </span>
  );
}

export function ResourceCard({ resource, onDelete }: { resource: Resource; onDelete: () => void }) {
  return (
    <div className="bg-surface border border-border-soft rounded-lg px-3 py-2.5 text-[13px] flex gap-2.5 items-start">
      <span className="flex-shrink-0 mt-0.5">{typeIcon(resource.type)}</span>
      <div className="flex-1 min-w-0">
        {resource.url ? (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline break-words"
          >
            {resource.title}
          </a>
        ) : (
          <span className="font-semibold break-words">{resource.title}</span>
        )}
        {resource.content && (
          <div className="text-text-dim text-[12.5px] mt-1 whitespace-pre-wrap break-words">{resource.content}</div>
        )}
      </div>
      <button onClick={onDelete} className="text-text-faint hover:text-rust flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}

export function ResourceForm({
  onSave,
  onCancel,
}: {
  onSave: (data: { type: ResourceType; title: string; url: string; content: string }) => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState<ResourceType>("link");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");

  return (
    <div className="bg-surface border border-border-soft rounded-lg p-3 mt-1.5">
      <select
        value={type}
        onChange={(e) => setType(e.target.value as ResourceType)}
        className="w-full bg-bg-2 border border-border rounded-md px-2.5 py-2 text-[13.5px] mb-2"
      >
        <option value="link">🔗 Link</option>
        <option value="article">📰 Article</option>
        <option value="video">🎬 Video</option>
        <option value="book">📕 Book / passage</option>
        <option value="note">📝 Note</option>
      </select>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-bg-2 border border-border rounded-md px-2.5 py-2 text-[13.5px] mb-2"
      />
      <input
        type="url"
        placeholder="URL (optional)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full bg-bg-2 border border-border rounded-md px-2.5 py-2 text-[13.5px] mb-2"
      />
      <textarea
        placeholder="Notes or excerpt (optional)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={2}
        className="w-full bg-bg-2 border border-border rounded-md px-2.5 py-2 text-[13.5px] mb-2 resize-y"
      />
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (!title.trim()) return;
            onSave({ type, title, url, content });
          }}
          className="px-3 py-1.5 rounded-md text-[12.5px] font-semibold bg-amber text-[#2a2117]"
        >
          Save
        </button>
        <button onClick={onCancel} className="px-3 py-1.5 rounded-md text-[12.5px] font-semibold text-text-faint">
          Cancel
        </button>
      </div>
    </div>
  );
}
