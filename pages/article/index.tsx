import { InferGetServerSidePropsType } from 'next';
import { observer } from 'mobx-react';
import { FC } from 'react';
import { Container } from 'react-bootstrap';

import PageHead from '../../components/PageHead';
import { ArticleList } from '../../components/Article/List';
import articleI18nStore from '../../models/ArticleI18n';
import { i18n } from '../../models/Translation';
import { withTranslation } from '../api/base';

export const getServerSideProps = withTranslation(async () => {
  articleI18nStore.clear();
  const list = await articleI18nStore.getList({}, 1,6)
  return { props: { list } };
});

const ArticleListPage: FC<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = observer(({ list }) => {
  const { t } = i18n;
  return (
    <Container className="py-5">
      <PageHead title={t('our_blogs')} />

      <h1 className="mb-5 text-center">{t('our_blogs')}</h1>

      <ArticleList defaultData={list} />
    </Container>
  );
});

export default ArticleListPage;
