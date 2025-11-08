export async function imageUpload(req, res) {
  const { filename } = req.file;
  const path = `files/${filename}`;
  return res.status(201).json({ message: '업로드 성공', path });
}
