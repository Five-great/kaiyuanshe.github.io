import { observer } from 'mobx-react';
import { PureComponent } from 'react';
import { Spinner } from 'react-bootstrap';

import { ArticleCard } from './Card';
import { BaseArticle } from '../../pages/api/article';
import articleI18nStore, { Article, getArticleList } from '../../models/ArticleI18n';
import { i18n } from '../../models/Translation';

export interface ArticleRecommendProps extends Pick<Article, 'alias'> {
  className?: string;
}

@observer
export default class ArticleRecommend extends PureComponent<
  ArticleRecommendProps,
  { list: BaseArticle[] }
> {
  componentDidMount() {
    articleI18nStore.getRecommendList(this.props.alias + '',i18n.currentLanguage);
  }

  render() {
    const { className } = this.props,
      { downloading, currentRecommend } = articleI18nStore,
      { t } = i18n;
      const currentRecommendList = getArticleList(currentRecommend)

    return (
      <aside className={className}>
        <h2 className="mt-4">{t('related_articles')}</h2>

        {!currentRecommend[0] ? (
          <div className="text-center p-4">
            {downloading > 0 ? (
              <Spinner animation="grow" variant="primary" />
            ) : (
              t('no_data')
            )}
          </div>
        ) : (
          currentRecommendList.map(item => (
            <ArticleCard key={item.id + ''} className="mt-3" {...item} />
          ))
        )}
      </aside>
    );
  }
}
