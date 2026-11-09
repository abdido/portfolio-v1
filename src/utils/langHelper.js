export const getLocalizedArticle = (article, language) => {
  if (!article) return article;
  if (language === 'EN') {
    return {
      ...article,
      title: article.titleEn || article.title,
      excerpt: article.excerptEn || article.excerpt,
      content: article.contentEn || article.content,
      category: article.categoryEn || article.category
    };
  }
  return article;
};

export const getLocalizedProject = (project, language) => {
  if (!project) return project;
  if (language === 'EN') {
    return {
      ...project,
      title: project.titleEn || project.title,
      summary: project.summaryEn || project.summary,
      description: project.descriptionEn || project.description,
      category: project.categoryEn || project.category,
      features: project.featuresEn?.length ? project.featuresEn : project.features
    };
  }
  return project;
};
