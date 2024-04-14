import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Toolbar from './Toolbar';
import Heading from "@tiptap/extension-heading";
import Underline from '@tiptap/extension-underline';
import OrderedList from '@tiptap/extension-ordered-list';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';

export default function TipTap({ description, onChange } : { description: string, onChange: (value: string) => void}) {
    const editor = useEditor({
        extensions: [ StarterKit.configure(), 
            Heading.configure({
            HTMLAttributes: {
                class: "text-2xl font-bold",
                levels: [1]
            }
        }),
            Underline.configure(),
            OrderedList.configure({
                HTMLAttributes: {
                    class: "list-decimal"
                }
            }),
            BulletList.configure({
                HTMLAttributes: {
                    class: "list-disc"
                }
            }),
            ListItem.configure({
                HTMLAttributes: {
                    class: "ml-8 list-item"
                }
            }),
        ],
        content: description,
        editorProps: {
            attributes: {
                class: "prose rounded-md border min-h-[150px] border-input bg-background p-2 px-4 active:outline-none focus:outline-none focus:border-primary"
            }
        },
        onUpdate({ editor }) {
            onChange(editor.getHTML());
        }
    });

    return (
        <div className="flex flex-col justify-stretch min-h-[250px]">
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )

}
