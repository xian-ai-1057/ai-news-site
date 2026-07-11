// 內部連結統一由此產生：slug/tag 可能含 %、空白等字元，必須經 encodeURIComponent
// 否則瀏覽器會組出無效的百分比序列（HTTP 400）。
export function articleUrl(slug: string): string {
  return "/articles/" + encodeURIComponent(slug);
}

export function noteUrl(slug: string): string {
  return "/notes/" + encodeURIComponent(slug);
}

export function tagUrl(tag: string): string {
  return "/tags/" + encodeURIComponent(tag);
}

export function digestUrl(date: string): string {
  return "/digest/" + date;
}

// 還原 dynamic route param：請求時 param 是 percent-encoded，需 decode；
// 但 build 預渲染（generateStaticParams → generateMetadata）可能拿到原始字串，
// 含裸 % 的 slug（如「…50%」）會讓 decodeURIComponent 拋 URI malformed——此時原樣返回。
export function decodeSlugParam(param: string): string {
  try {
    return decodeURIComponent(param);
  } catch {
    return param;
  }
}
