import { observer } from 'mobx-react';
import { FC } from 'react';
import { Row, Col } from 'react-bootstrap';
import { ScrollListProps } from 'mobx-restful-table';

import { XScrollList } from '../ScrollList';
import { ArticleCard } from './Card';
import { BaseArticle } from '../../pages/api/article';
import { ArticleI18n, ArticleI18nModel, getArticleList } from '../../models/ArticleI18n';

export type ArticleListProps = ScrollListProps<ArticleI18n>;

export const ArticleListLayout: FC<{ data: BaseArticle[] }> = ({ data }) => (
  <Row as="section" xs={1} sm={2} xl={3} xxl={4} className="g-3 my-4">
    {data.map(item => (
      <Col key={item.id + ''}>
        <ArticleCard className="h-100" {...item} />
      </Col>
    ))}
  </Row>
);

@observer
export class ArticleList extends XScrollList<ArticleListProps> {
  store = new ArticleI18nModel();

  constructor(props: ArticleListProps) {
    super(props);
    this.boot();
  }
  renderList() {
    return <ArticleListLayout data={getArticleList(this.store.allItems)} />;
  }
}
