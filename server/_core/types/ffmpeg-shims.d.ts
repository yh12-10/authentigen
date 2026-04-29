declare module "ffmpeg-static" {
  const ffmpegPath: string | null;
  export default ffmpegPath;
}

declare module "ffprobe-static" {
  export const path: string;
}
