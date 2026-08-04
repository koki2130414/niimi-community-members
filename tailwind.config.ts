import type { Config } from "tailwindcss";

// ブランドカラーはこのファイルで一元管理する。
// 要件「色は設定ファイルから変更できるようにする」に対応し、
// 実際の色コードはすべてここに集約し、コンポーネント側では
// bg-brand-green / text-brand-gold のようなセマンティックな名前だけを使う。
const brandColors = {
  brand: {
    // メインカラー: 白・生成り・深い緑
    cream: "#FAF6ED",
    white: "#FFFFFF",
    green: {
      DEFAULT: "#2F4F3A",
      dark: "#1F3A28",
      light: "#4A6B54",
    },
    // アクセント: 稲穂をイメージしたベージュ・ゴールド
    gold: {
      DEFAULT: "#C9A15A",
      light: "#E4CFA0",
    },
    beige: "#EFE3C8",
    // 状態表示用
    danger: "#B3452C",
    warning: "#C98A2C",
  },
};

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: brandColors,
      fontFamily: {
        sans: [
          "'Hiragino Sans'",
          "'Hiragino Kaku Gothic ProN'",
          "'Noto Sans JP'",
          "Meiryo",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        card: "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
