"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Modal, Upload } from "antd";
import type { RcFile, UploadRequestOption } from "rc-upload/lib/interface";
import type { UploadFile } from "antd/es/upload/interface";

function isImageUrl(url?: string) {
  if (!url) return false;
  return /(\.png|\.jpg|\.jpeg|\.gif|\.webp|data:image\/.+;base64,)/i.test(url);
}

export function useUploadPreview(initial: UploadFile[] = []) {
  const [fileList, setFileList] = useState<UploadFile[]>(initial);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [previewTitle, setPreviewTitle] = useState<string>("");

  const handlePreview = useCallback(async (file: UploadFile) => {
    const url = (file.url || file.thumbUrl) as string | undefined;
    if (!url) return;
    if (isImageUrl(url)) {
      setPreviewImage(url);
      setPreviewOpen(true);
      setPreviewTitle(file.name || "Prévisualisation");
    } else {
      // Open non-image in a new tab
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, []);

  const customRequest = useCallback(async (options: UploadRequestOption) => {
    const { onSuccess, onError, file } = options;
    try {
      const fd = new FormData();
      fd.append("files", file as RcFile);
      const res = await fetch("/api/uploads/identity", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw json;
      const urls = (json.results as Array<{ url?: string }>).map((r) => r.url).filter(Boolean) as string[];
      if (urls.length) {
        // Update fileList with uploaded URL
        const url = urls[0];
        const newFile: UploadFile = {
          uid: `${Date.now()}-${Math.random()}`,
          name: (file as RcFile).name,
          status: "done",
          url,
        };
        setFileList((prev) => [...prev, newFile]);
      }
      onSuccess && onSuccess(json);
    } catch (err) {
      onError && onError(err as any);
    }
  }, []);

  const previewModal = useMemo(
    () => (
      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)}>
        {previewImage && <img alt="preview" style={{ width: "100%" }} src={previewImage} />}
      </Modal>
    ),
    [previewOpen, previewTitle, previewImage]
  );

  const getUrls = useCallback(() => fileList.map((f) => (f.url || f.thumbUrl)).filter(Boolean) as string[], [fileList]);

  return { fileList, setFileList, handlePreview, customRequest, previewModal, getUrls };
}
