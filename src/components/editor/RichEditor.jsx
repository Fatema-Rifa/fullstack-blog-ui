import { useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Undo, Redo, Link as LinkIcon, Image as ImageIcon,
  Loader2, Upload
} from "lucide-react";
import clsx from "clsx";
import { uploadToCloudinary } from "../../lib/cloudinary";
import toast from "react-hot-toast";

const ToolbarButton = ({ onClick, active, title, disabled, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={clsx(
      "p-1.5 rounded-lg transition-all duration-150 text-surface-500 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-700 disabled:opacity-50",
      active && "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300"
    )}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-surface-200 dark:bg-surface-700 mx-1" />;

export default function RichEditor({ value, onChange }) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Tell your story…" }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "focus:outline-none" },
    },
  });

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    setUploadingImage(true);
    const toastId = toast.loading("Uploading image to Cloudinary…");
    try {
      const { url } = await uploadToCloudinary(file, "blogs");
      editor.chain().focus().setImage({ src: url }).run();
      toast.success("Image uploaded & inserted!", { id: toastId });
    } catch (err) {
      toast.error(err?.message || "Failed to upload image", { id: toastId });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const addImage = () => {
    // Trigger hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const tools = [
    { icon: Heading1, title: "Heading 1", action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive("heading", { level: 1 }) },
    { icon: Heading2, title: "Heading 2", action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }) },
    { icon: Heading3, title: "Heading 3", action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }) },
    null,
    { icon: Bold,          title: "Bold",          action: () => editor.chain().focus().toggleBold().run(),          active: editor.isActive("bold") },
    { icon: Italic,        title: "Italic",        action: () => editor.chain().focus().toggleItalic().run(),        active: editor.isActive("italic") },
    { icon: Strikethrough, title: "Strikethrough", action: () => editor.chain().focus().toggleStrike().run(),        active: editor.isActive("strike") },
    { icon: Code,          title: "Inline Code",   action: () => editor.chain().focus().toggleCode().run(),          active: editor.isActive("code") },
    null,
    { icon: List,          title: "Bullet List",   action: () => editor.chain().focus().toggleBulletList().run(),    active: editor.isActive("bulletList") },
    { icon: ListOrdered,   title: "Ordered List",  action: () => editor.chain().focus().toggleOrderedList().run(),   active: editor.isActive("orderedList") },
    { icon: Quote,         title: "Blockquote",    action: () => editor.chain().focus().toggleBlockquote().run(),    active: editor.isActive("blockquote") },
    { icon: Minus,         title: "Horizontal Rule", action: () => editor.chain().focus().setHorizontalRule().run(), active: false },
    null,
    { icon: LinkIcon,  title: "Add Link",  action: addLink,  active: editor.isActive("link") },
    {
      icon: uploadingImage ? Loader2 : ImageIcon,
      title: uploadingImage ? "Uploading to Cloudinary..." : "Upload Image to Cloudinary",
      action: addImage,
      active: uploadingImage,
      disabled: uploadingImage,
    },
    null,
    { icon: Undo, title: "Undo", action: () => editor.chain().focus().undo().run(), active: false },
    { icon: Redo, title: "Redo", action: () => editor.chain().focus().redo().run(), active: false },
  ];

  return (
    <div className="tiptap-editor border border-surface-200 dark:border-surface-700 rounded-2xl overflow-hidden bg-white dark:bg-surface-900 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
      {/* Hidden file input for Cloudinary image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/50">
        {tools.map((tool, idx) =>
          tool === null ? (
            <Divider key={idx} />
          ) : (
            <ToolbarButton
              key={tool.title}
              onClick={tool.action}
              active={tool.active}
              disabled={tool.disabled}
              title={tool.title}
            >
              <tool.icon size={15} className={tool.active && tool.icon === Loader2 ? "animate-spin" : ""} />
            </ToolbarButton>
          )
        )}
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} className="min-h-[350px]" />
    </div>
  );
}
