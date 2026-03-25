"use client";

import React, { useEffect, useState } from "react";
import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import SubScript from "@tiptap/extension-subscript";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  icon?: any;
}

const EditorComponent: React.FC<EditorProps> = ({
  value,
  onChange,
  placeholder,
  label,
  icon: Icon,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: placeholder || `Enter content...`,
      }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!mounted) return null;

  return (
    <div className="w-full">
      {label && (
        <label className="flex items-center text-sm mb-1 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-medium gap-2">
          {Icon && <Icon className="w-4 h-4 text-primary" />}
          {label}
        </label>
      )}

      <div className="p-[1px] rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20">
        <div className="rounded-xl bg-white border border-primary/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)] overflow-hidden">
          <RichTextEditor editor={editor} className="!border-none">
            <RichTextEditor.Toolbar sticky className="!bg-gray-50 !border-b !border-gray-200 !p-1">
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Bold />
                <RichTextEditor.Italic />
                <RichTextEditor.Underline />
                <RichTextEditor.Strikethrough />
                <RichTextEditor.Code />
                <RichTextEditor.ClearFormatting />
                <RichTextEditor.Highlight />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.H1 />
                <RichTextEditor.H2 />
                <RichTextEditor.H3 />
                <RichTextEditor.H4 />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Blockquote />
                <RichTextEditor.Hr />
                <RichTextEditor.BulletList />
                <RichTextEditor.OrderedList />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Subscript />
                <RichTextEditor.Superscript />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Link />
                <RichTextEditor.Unlink />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.AlignLeft />
                <RichTextEditor.AlignCenter />
                <RichTextEditor.AlignJustify />
                <RichTextEditor.AlignRight />
              </RichTextEditor.ControlsGroup>
            </RichTextEditor.Toolbar>

            <RichTextEditor.Content className="!text-black [&_*]:!text-black !p-4 min-h-[300px] focus:outline-none 
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:ml-4 [&_li]:ml-4 [&_*]::marker:!text-black
              [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-1 [&_h4]:font-bold" />
          </RichTextEditor>
        </div>
      </div>
    </div>
  );
};

export default EditorComponent;
