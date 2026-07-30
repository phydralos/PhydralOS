import { EDITABLE_IMAGE_FILE_EXTENSIONS, TEXT_EDITORS } from "utils/constants";

type Extension = {
  command?: string;
  icon?: string;
  process: string[];
  type?: string;
};

const types = {
  AudioPlaylist: {
    icon: "audio",
    process: ["Webamp"],
    type: "Audio Playlist File",
  },
  Font: {
    icon: "font",
    process: ["OpenType"],
    type: "Font File",
  },
  GraphicsEditor: {
    process: ["Photos", "Paint"],
    type: "Picture File",
  },
  HtmlDocument: {
    process: ["Browser", ...TEXT_EDITORS],
    type: "HTML Document",
  },
  Markdown: {
    icon: "marked",
    process: ["Marked", ...TEXT_EDITORS],
    type: "Markdown File",
  },
  MediaPlaylist: {
    process: ["VideoPlayer"],
    type: "Media Playlist File",
  },
  Music: {
    icon: "audio",
    process: ["Webamp", "VideoPlayer"],
  },
  PdfDocument: {
    icon: "pdf",
    process: ["PDF"],
    type: "PDF Document",
  },
  PythonFile: {
    command: "py",
    icon: "python",
    process: ["Terminal", ...TEXT_EDITORS],
    type: "Python File",
  },
  ScreenSaver: {
    process: ["ScreenSaver"],
    type: "Screen Saver",
  },
  SvgFile: {
    process: ["Photos", ...TEXT_EDITORS],
    type: "Scalable Vector Graphics File",
  },
  WasmFile: {
    command: "wapm",
    icon: "wapm",
    process: ["Terminal"],
    type: "WebAssembly Module File",
  },
  WinampSkin: {
    icon: "audio",
    process: ["Webamp", "FileExplorer"],
    type: "Winamp Skin File",
  },
  WysiwygHtmlDocument: {
    icon: "tinymce",
    process: ["TinyMCE", ...TEXT_EDITORS],
    type: "WYSIWYG HTML File",
  },
  ZipFile: {
    icon: "compressed",
    process: ["FileExplorer"],
    type: "Compressed (zipped) Folder",
  },
};

const extensions: Record<string, Extension> = {
  ".asx": types.AudioPlaylist,
  ".htm": types.HtmlDocument,
  ".html": types.HtmlDocument,
  ".m3u": types.AudioPlaylist,
  ".m3u8": types.MediaPlaylist,
  ".md": types.Markdown,
  ".mp3": types.Music,
  ".otf": types.Font,
  ".pdf": types.PdfDocument,
  ".pls": types.AudioPlaylist,
  ".py": types.PythonFile,
  ".rtf": types.WysiwygHtmlDocument,
  ".svg": types.SvgFile,
  ".ttf": types.Font,
  ".wasm": types.WasmFile,
  ".whtml": types.WysiwygHtmlDocument,
  ".woff": types.Font,
  ".wsz": types.WinampSkin,
  ".xscr": types.ScreenSaver,
  ".zip": types.ZipFile,
};

const addType =
  (type: Extension) =>
  (extension: string): void => {
    if (type.process) {
      if (extensions[extension]) {
        extensions[extension].process.push(...type.process);
      } else {
        extensions[extension] = type;
      }
    }
  };

EDITABLE_IMAGE_FILE_EXTENSIONS.forEach(addType(types.GraphicsEditor));

export default extensions;
