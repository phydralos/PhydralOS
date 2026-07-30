import { memo, useRef, useState, type FC, type DragEvent } from "react";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";

type ExifData = Record<string, Record<string, string>>;

const ExifViewer: FC<ComponentProcessProps> = () => {
  const [exifData, setExifData] = useState<ExifData | undefined>();
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadExif = (file: File): void => {
    setLoading(true);
    setError("");
    setExifData(undefined);

    const url = URL.createObjectURL(file);
    setImageUrl(url);

    const img = new Image();
    img.addEventListener("load", () => {
      import("exif-js").then(({ default: EXIF }) => {
        // @ts-expect-error exif-js types are incorrect - getData accepts HTMLImageElement
        EXIF.getData(img, () => {
          const allTags = EXIF.getAllTags(img) as Record<string, unknown>;
          const grouped: ExifData = {};
          const sectionRegex = /^[A-Z]+/;

          for (const [key, value] of Object.entries(allTags)) {
            const match = sectionRegex.exec(key);
            const section = match?.[0] ?? "Other";
            if (!grouped[section]) grouped[section] = {};
            grouped[section][key] = String(value);
          }

          setExifData(Object.keys(allTags).length > 0 ? grouped : undefined);
          setLoading(false);
        });
      });
    });
    img.addEventListener("error", () => {
      setError("Failed to load image");
      setLoading(false);
    });
    img.src = url;
  };

  const onDrop = (e: DragEvent): void => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) loadExif(file);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      style={{
        backgroundColor: "#1e1e2e",
        color: "#cdd6f4",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui, sans-serif",
        fontSize: "13px",
        height: "100%",
        overflow: "hidden",
      }}
>
      <div
        style={{
          backgroundColor: "#181825",
          borderBottom: "1px solid #313244",
          display: "flex",
          gap: "8px",
          padding: "8px 12px",
        }}
      >
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            backgroundColor: "#89b4fa",
            border: "none",
            borderRadius: "4px",
            color: "#1e1e2e",
            cursor: "pointer",
            fontWeight: 600,
            padding: "6px 16px",
          }}
          type="button"
        >
          Open Image
        </button>
        <input
          ref={fileInputRef}
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) loadExif(file);
          }}
          style={{ display: "none" }}
          type="file"
        />
        {loading && <span style={{ color: "#a6adc8" }}>Loading EXIF...</span>}
        {error && <span style={{ color: "#f38ba8" }}>{error}</span>}
      </div>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {imageUrl && (
          <div
            style={{
              backgroundColor: "#11111b",
              maxWidth: "300px",
              minWidth: "200px",
              overflow: "auto",
              padding: "12px",
            }}
          >
            <img
              alt="Preview"
              src={imageUrl}
              style={{ height: "auto", maxWidth: "100%" }}
            />
          </div>
        )}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "12px",
          }}
        >
          {exifData ? (
            Object.entries(exifData).map(([section, tags]) => (
              <div key={section} style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    borderBottom: "1px solid #313244",
                    color: "#89b4fa",
                    fontWeight: 600,
                    marginBottom: "8px",
                    paddingBottom: "4px",
                  }}
                >
                  {section}
                </div>
                {Object.entries(tags).map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginBottom: "2px",
                    }}
                  >
                    <span style={{ color: "#a6adc8", minWidth: "160px" }}>
                      {key}
                    </span>
                    <span style={{ color: "#cdd6f4" }}>{value}</span>
                  </div>
                ))}
              </div>
            ))
          ) : (
            !loading &&
            !error && (
              <div style={{ color: "#6c7086", padding: "20px" }}>
                Drop an image or click &quot;Open Image&quot; to view EXIF
                metadata.
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(ExifViewer);
