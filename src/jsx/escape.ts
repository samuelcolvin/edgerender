// TODO could use the approach in https://github.com/component/escape-html/blob/master/index.js
// but not sure it would be faster
const html_tags: Record<string, string> = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}

const replace_html = (letter: string): string => html_tags[letter] || letter

export default class HtmlEscape {
  static content(s: string): string {
    return s.replace(/[&<>]/g, replace_html)
  }
  static attr_double(s: string): string {
    return s.replace(/[&<>"]/g, replace_html)
  }
  static attr_single(s: string): string {
    return s.replace(/[&<>']/g, replace_html)
  }
}
