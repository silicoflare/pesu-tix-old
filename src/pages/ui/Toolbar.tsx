"use client";

import { type Editor } from "@tiptap/react";
import {
    Heading,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List,
    ListOrdered
} from "lucide-react";

import { Toggle } from "~/components/ui/toggle";

type Props = {
    editor: Editor | null;
}

export default function Toolbar({ editor } : Props)   {
    if (!editor) return null;

    return (
        <div className="border border-input bg-transparent rounded-md p-3 flex items-center justify-between gap-x-3 mb-2">
            <Toggle 
                size="sm" pressed={editor.isActive("heading")} 
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
                    <Heading size={20} />
            </Toggle>
            <Toggle 
                size="sm" pressed={editor.isActive("bold")} 
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
            >
                    <Bold size={20} />
            </Toggle>
            <Toggle 
                size="sm" pressed={editor.isActive("italic")} 
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            >
                    <Italic size={20} />
            </Toggle> 
            <Toggle 
                size="sm" pressed={editor.isActive("underline")} 
                onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
            >
                    <Underline size={20} />
            </Toggle> 
            <Toggle 
                size="sm" pressed={editor.isActive("strike")} 
                onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            >
                    <Strikethrough size={20} />
            </Toggle>
            <Toggle 
                size="sm" pressed={editor.isActive("bulletList")} 
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            >
                    <List size={20} />
            </Toggle>
            <Toggle 
                size="sm" pressed={editor.isActive("orderedList")} 
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            >
                    <ListOrdered size={20} />
            </Toggle>
        </div>
    )
}
