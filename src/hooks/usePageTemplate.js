import { useEffect, useMemo } from "react";
import { useLayoutTemplate } from "@/layouts/LayoutTemplateContext";

export function usePageTemplate(template) {
  const { setTemplate, template: currentTemplate } = useLayoutTemplate();

  const normalizedTemplate = useMemo(() => {
    if (!template) return null;
    return {
      title: template.title ?? null,
      subtitle: template.subtitle ?? null,
      user: template.user
        ? {
            name: template.user.name ?? null,
            role: template.user.role ?? null,
            urlDetail: template.user.urlDetail ?? null,
          }
        : null,
    };
  }, [
    template?.title,
    template?.subtitle,
    template?.user?.name,
    template?.user?.role,
    template?.user?.urlDetail,
  ]);

  useEffect(() => {
    if (!normalizedTemplate) return;

    setTemplate((prev) => ({
      ...prev,
      ...normalizedTemplate,
      user: normalizedTemplate.user ?? prev.user,
    }));
  }, [normalizedTemplate, setTemplate]);

  return { template: currentTemplate, setTemplate };
}
