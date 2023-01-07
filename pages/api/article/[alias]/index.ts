import { basename } from 'path';
import { NextApiResponse } from 'next';
import { TableCellLink } from 'lark-ts-sdk';

import { safeAPI } from '../../base';
import { blobClient } from '../../../../models/Base';
import {
  ARTICLE_LARK_BASE_ID,
  ARTICLE_LARK_TABLE_ID,
  makeFilter,
  getBITableList,
  normalizeText,
  ARTICLE_I18N_LARK_TABLE_ID,
} from '../../../../models/Lark';
import { Article, normalizeArray } from '../../../../models/ArticleI18n';
import { BaseArticle, BaseArticleI18n } from '../index';

export async function getOneArticle(alias: string,langCode:string) {
  
  const { items:articleI18n } = await getBITableList<BaseArticleI18n>({
    database: ARTICLE_LARK_BASE_ID,
    table: ARTICLE_I18N_LARK_TABLE_ID,
    filter: makeFilter({alias}),
  })
 
  if(articleI18n){
    const [{fields }] = articleI18n;
    fields.langs = normalizeArray(fields.langs);
    !(fields.langs as string[]).includes(langCode)&&(langCode=(fields.langs as string[])[0]);

  }

  const { items } = await getBITableList<BaseArticle>({
    database: ARTICLE_LARK_BASE_ID,
    table: ARTICLE_LARK_TABLE_ID,
    filter: makeFilter({ alias,langCode: langCode },"AND"),
  });
  
  return items&&items.find(({ fields }) => fields.alias === alias);
}

export default safeAPI(
  async ({ method, query }, response: NextApiResponse<Article>) => {
    switch (method) {
      case 'GET': {

        const article = await getOneArticle(query.alias + '', query.lang+'');

        if (!article) return response.status(404);

        const { id, fields } = article;

        const path = `article/${basename(
          normalizeText(fields.link as TableCellLink),
        )}.html`;

        const { body } = await blobClient.get<ArrayBuffer>(path);

        response.json({
          ...fields,
          id: id!,
          content: new TextDecoder().decode(body),
        });
      }
    }
  },
);
