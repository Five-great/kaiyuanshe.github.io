import { parseURLData } from 'web-utility';
import { DataObject } from 'mobx-restful';
import { TableCellValue, TableRecordList } from 'lark-ts-sdk';
import { NextApiResponse } from 'next';

import { safeAPI } from '../base';
import {
  ARTICLE_LARK_BASE_ID,
  ARTICLE_I18N_LARK_TABLE_ID,
  makeFilter,
  getBITableList,
} from '../../../models/Lark';

export type BaseArticle = Record<
  | 'id'
  | 'title'
  | 'author'
  | 'license'
  | 'type'
  | 'tags'
  | 'kId'
  | 'langCode'
  | 'summary'
  | 'image'
  | 'publishedAt'
  | 'link'
  | 'alias',
  TableCellValue
>;

export type BaseArticleI18n = Record<
  | 'id'
  | 'tags'
  | 'alias'
  | 'kId'
  | 'langs'
  | 'articles',
  TableCellValue
>;

export default safeAPI(
  async (
    { method, url },
    response: NextApiResponse<TableRecordList<BaseArticleI18n>['data']>,
  ) => {
    switch (method) {
      case 'GET': {
        const { page_size, page_token, ...filter } = parseURLData(
          url!,
        ) as DataObject;

        const pageData = await getBITableList<BaseArticleI18n>({
          database: ARTICLE_LARK_BASE_ID,
          table: ARTICLE_I18N_LARK_TABLE_ID,
          page_size,
          page_token,
          filter: makeFilter(filter),
        });
        response.json(pageData);
      }
    }
  },
);