import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter description...",
  minHeight = "200px",
  className = "",
}) => {
  return (
    <div className={`border rounded-md overflow-hidden [&_.ql-toolbar]:border-0 [&_.ql-container]:border-0 [&_.ql-toolbar]:rounded-t-md [&_.ql-container]:rounded-b-md ${className}`}>
      <style>{`
        .ql-container {
          min-height: ${minHeight} !important;
        }
        .ql-editor {
          min-height: ${minHeight} !important;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={{
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'align': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            ['image', 'blockquote', 'code-block'],
            ['link'],
            ['clean']
          ],
        }}
        formats={[
          'header',
          'bold', 'italic', 'underline', 'strike',
          'align',
          'list', 'bullet', 'indent',
          'image', 'blockquote', 'code-block',
          'link'
        ]}
      />
    </div>
  );
};

export default RichTextEditor;

