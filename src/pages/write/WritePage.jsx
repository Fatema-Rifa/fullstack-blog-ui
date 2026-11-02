import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ImagePlus, Loader2, Eye, Save, Send, X, Tag as TagIcon } from "lucide-react";
import { postService, categoryService, tagService } from "../../services";
import RichEditor from "../../components/editor/RichEditor";
import { uploadToCloudinary } from "../../lib/cloudinary";
import toast from "react-hot-toast";
import clsx from "clsx";

export default function WritePage() {
  const { id }   = useParams();        // if editing
  const navigate = useNavigate();
  const isEdit   = !!id;

  const [content,    setContent]    = useState("");
  const [coverFile,  setCoverFile]  = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagInput,   setTagInput]   = useState("");
  const [activeTab,  setActiveTab]  = useState("write"); // "write" | "preview"

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { status: "draft" },
  });

  // Load categories & tags
  const { data: catData } = useQuery({ queryKey: ["categories"], queryFn: categoryService.getAll });
  const { data: tagData } = useQuery({ queryKey: ["tags"], queryFn: tagService.getAll });
  const categories = catData?.categories || [];
  const allTags    = tagData?.tags       || [];

  // Load post if editing
  const { data: postData } = useQuery({
    queryKey: ["post-edit", id],
    queryFn: () => postService.getBySlug(id),
    enabled: isEdit,
  });

  useEffect(() => {
    const post = postData?.post;
    if (!post) return;

    setValue("title", post.title);
    setValue("excerpt", post.excerpt || "");
    setValue("category", post.category?._id || "");
    setValue("status", post.status);
    setContent(post.content || "");
    setCoverPreview(post.coverImage?.url || "");
    setSelectedTags(post.tags?.map((t) => t.name) || []);
  }, [postData, setValue]);

  const submittingRef = useRef(false);

  const mutation = useMutation({
    mutationFn: (formData) =>
      isEdit ? postService.update(postData?.post?._id, formData) : postService.create(formData),
    onSuccess: ({ post }) => {
      toast.success(isEdit ? "Post updated!" : "Post published!");
      navigate(`/posts/${post.slug}`);
    },
    onError: (err) => toast.error(err?.response?.data?.message || "Failed to save post"),
    onSettled: () => { submittingRef.current = false; },
  });

  const onSubmit = async (data, overrideStatus) => {
    // Guard against duplicate submissions
    if (submittingRef.current || mutation.isPending) return;
    submittingRef.current = true;

    const status = overrideStatus || data.status;

    const plainContent = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    if (plainContent.length < 50) {
      toast.error("Post content must be at least 50 characters");
      submittingRef.current = false;
      return;
    }
    if (data.title.trim().length < 5) {
      toast.error("Title must be at least 5 characters");
      submittingRef.current = false;
      return;
    }
    try {
      const postPayload = {
        title: data.title.trim(),
        content,
        excerpt: data.excerpt || "",
        status,
        tags: selectedTags,
      };
      if (data.category) postPayload.category = data.category;

      if (coverFile) {
        const uploadedCover = await uploadToCloudinary(coverFile, "blogs");
        if (!uploadedCover?.url) {
          throw new Error("Cloudinary did not return an image URL");
        }
        postPayload.coverImage = {
          url: uploadedCover.url,
          publicId: uploadedCover.publicId,
        };
      }

      mutation.mutate(postPayload);
    } catch (error) {
      submittingRef.current = false;
      toast.error(error?.message || "Cover image upload failed");
    }
  };

  const handleCover = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const addTag = (name) => {
    const trimmed = name.trim().toLowerCase();
    if (trimmed && !selectedTags.includes(trimmed) && selectedTags.length < 10) {
      setSelectedTags((t) => [...t, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tag) => setSelectedTags((t) => t.filter((x) => x !== tag));

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Top bar */}
      <div className="sticky top-16 z-30 glass border-b border-surface-200 dark:border-surface-700">
        <div className="page-container flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
              {isEdit ? "✏" : "B"}
            </div>
            <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">
              {isEdit ? "Edit Post" : "New Post"}
            </span>
            {watch("status") === "draft" && <span className="badge-warning ml-2">Draft</span>}
          </div>

          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="flex bg-surface-100 dark:bg-surface-800 rounded-xl p-1 gap-1 text-sm">
              {["write", "preview"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg capitalize font-medium transition-all",
                    activeTab === tab
                      ? "bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm"
                      : "text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                  )}
                >
                  {tab === "preview" ? <><Eye size={13} className="inline mr-1" />Preview</> : "Write"}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit((d) => onSubmit(d, "draft"))}
              disabled={mutation.isPending}
              className="btn-md btn-secondary"
            >
              <Save size={15} /> Save Draft
            </button>
            <button
              onClick={handleSubmit((d) => onSubmit(d, "published"))}
              disabled={mutation.isPending}
              className="btn-md btn-gradient"
            >
              {mutation.isPending
                ? <Loader2 size={15} className="animate-spin" />
                : <><Send size={15} /> Publish</>}
            </button>
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main editor */}
          <div className="lg:col-span-3 space-y-5">
            {/* Cover image */}
            <div
              className={clsx(
                "relative rounded-2xl overflow-hidden border-2 border-dashed transition-all cursor-pointer group",
                coverPreview ? "border-transparent" : "border-surface-300 dark:border-surface-600 hover:border-primary-400 dark:hover:border-primary-600"
              )}
              onClick={() => document.getElementById("cover-upload").click()}
            >
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="Cover" className="w-full h-52 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="text-white text-sm font-medium"><ImagePlus size={16} className="inline mr-1" />Change cover</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setCoverFile(null); setCoverPreview(""); }}
                      className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-36 gap-2 text-surface-400">
                  <ImagePlus size={28} />
                  <span className="text-sm">Click to add cover image</span>
                </div>
              )}
              <input id="cover-upload" type="file" accept="image/*" className="hidden" onChange={handleCover} />
            </div>

            {/* Title */}
            <input
              {...register("title", { required: "Title is required", minLength: { value: 5, message: "Min 5 chars" } })}
              placeholder="Your post title…"
              className="w-full bg-transparent text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-surface-900 dark:text-white placeholder:text-surface-300 dark:placeholder:text-surface-700 focus:outline-none border-none"
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}

            {/* Editor / Preview */}
            {activeTab === "write" ? (
              <RichEditor value={content} onChange={setContent} />
            ) : (
              <div className="card p-8">
                {content ? (
                  <div className="prose-blog" dangerouslySetInnerHTML={{ __html: content }} />
                ) : (
                  <p className="text-surface-400 text-center py-10">Nothing to preview yet. Start writing!</p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar settings */}
          <aside className="space-y-5">
            {/* Status */}
            <div className="card p-5">
              <label className="label">Status</label>
              <select {...register("status")} className="input text-sm">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Category */}
            <div className="card p-5">
              <label className="label">Category</label>
              <select {...register("category")} className="input text-sm">
                <option value="">— Select category —</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="card p-5">
              <label className="label flex items-center gap-1"><TagIcon size={14} /> Tags <span className="text-surface-400 font-normal ml-1">({selectedTags.length}/10)</span></label>

              {/* Selected tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selectedTags.map((tag) => (
                    <span key={tag} className="badge-primary flex items-center gap-1">
                      #{tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors"><X size={10} /></button>
                    </span>
                  ))}
                </div>
              )}

              {/* Tag input */}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); }
                }}
                placeholder="Add tag & press Enter"
                className="input text-sm"
              />

              {/* Suggestions */}
              {tagInput && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {allTags
                    .filter((t) => t.name.includes(tagInput.toLowerCase()) && !selectedTags.includes(t.name))
                    .slice(0, 8)
                    .map((t) => (
                      <button key={t._id} onClick={() => addTag(t.name)} className="badge-surface hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-900/20 dark:hover:text-primary-300 transition-colors text-xs">
                        #{t.name}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Excerpt */}
            <div className="card p-5">
              <label className="label">Excerpt <span className="text-surface-400 font-normal">(optional)</span></label>
              <textarea
                {...register("excerpt")}
                placeholder="Short summary shown in cards…"
                className="input text-sm resize-none"
                rows={3}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
