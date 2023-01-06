import type { NextApiResponse } from 'next';

import { getArticleI18nList, normalizeArray } from '../../../../models/ArticleI18n';
import {
  ARTICLE_LARK_BASE_ID,
  ARTICLE_LARK_TABLE_ID,
  makeFilter,
  getBITableList,
  ARTICLE_I18N_LARK_TABLE_ID,
} from '../../../../models/Lark';
import { safeAPI } from '../../base';
import { BaseArticle, BaseArticleI18n } from '../index';
import { getOneArticle } from './index';

export default safeAPI(
  async ({ method, query }, response: NextApiResponse<BaseArticleI18n[]>) => {
    switch (method) {
      case 'GET': {
        const article = await getOneArticle(query.alias + '', query.lang+'');

        if (!article) return response.status(404);

        const tags = (article.fields.tags + '').split(/\s+/);
        
        const { items } = await getBITableList<BaseArticleI18n>({
          database: ARTICLE_LARK_BASE_ID,
          table: ARTICLE_I18N_LARK_TABLE_ID,
          filter: makeFilter({tagsText: tags},'OR'),
        })
        
        const ArticleKIdsData:Record<string,BaseArticleI18n> = {}
          const ArticleKids: string[] = [];
          items.map(item=>{
            ArticleKids.push(item.fields.kId as string)
            item.fields.langs = normalizeArray(item.fields.langs);
            ArticleKIdsData[item.fields.kId as string] = item.fields
          })

          const { items:articleData } = await getBITableList<BaseArticle>({
            database: ARTICLE_LARK_BASE_ID,
            table: ARTICLE_LARK_TABLE_ID,
            filter: makeFilter({ kId: ArticleKids }, 'OR'),
          });

        const list = getArticleI18nList(articleData, ArticleKids, ArticleKIdsData) as unknown as BaseArticleI18n[];

        response.json(list);
      }
    }
  },
);
