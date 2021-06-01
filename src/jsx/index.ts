export async function render_jsx(jsx_element: JSX.Element): Promise<string> {
  return await (jsx_element as any).render()
}
