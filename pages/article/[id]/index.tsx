import { PureComponent } from 'react';
import { InferGetServerSidePropsType } from 'next';
import { Container, Row, Col } from 'react-bootstrap';
import Giscus from '@giscus/react';

import PageHead from '../../../components/PageHead';
import ArticleRecommend from '../../../components/Article/Recommend';
import articleI18nStore, { Article} from '../../../models/ArticleI18n';
// import articleStore, {  } from '../../../models/Article';
import { withErrorLog, withTranslation } from '../../api/base';
import { i18n } from '../../../models/Translation';

export const getServerSideProps = withErrorLog<{ id: string ,}, Article>(withTranslation(
  async ({ params }) => {
    const props = await articleI18nStore.getArticleOne(params!.id,i18n.currentLanguage);
  
    return { props: props as Article};
  },
));

export default class ArticleDetailPage extends PureComponent<
  InferGetServerSidePropsType<typeof getServerSideProps>
> {
  renderAuthorization() {
    const { license = 'CC-4.0' } = this.props;

    return (
      <>
        <p className="text-muted mt-3 small">版权声明：{license}</p>
      </>
    );
  }

  render() {
    const { alias, title, content } = this.props;

    return (
      <Container className="py-5">
        <PageHead title={title + ''} />

        <Row>
          <Col
            as="article"
            xs={12}
            sm={9}
            dangerouslySetInnerHTML={{ __html: content }}
          />
          <Col xs={12} sm={3}>
            {this.renderAuthorization()}

            <ArticleRecommend alias={alias} />
          </Col>
        </Row>

        <Giscus
          repo="kaiyuanshe/kaiyuanshe.github.io"
          repoId="MDEwOlJlcG9zaXRvcnkxMzEwMDg4MTI="
          category="General"
          categoryId="DIC_kwDOB88JLM4COLSV"
          mapping="pathname"
          reactionsEnabled="1"
          emitMetadata="1"
          inputPosition="bottom"
          theme="light"
          lang="zh-CN"
        />
      </Container>
    );
  }
}
