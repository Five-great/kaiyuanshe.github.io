import { parseURLData } from 'web-utility';
import { DataObject } from 'mobx-restful';
import { TableRecordList } from 'lark-ts-sdk';
import { NextApiResponse } from 'next';

import { safeAPI } from '../base';
import {
  ARTICLE_LARK_BASE_ID,
  makeFilter,
  getBITableList,
  ARTICLE_LARK_TABLE_ID,
} from '../../../models/Lark';
import { BaseArticle } from './index';


export default safeAPI(
  async (
    { method, url, body },
    response: NextApiResponse<TableRecordList<BaseArticle>['data']['items']>,
  ) => {
    switch (method) {
      case 'POST': {
        const { page_size, page_token, ...filter } = parseURLData(
          url!,
        ) as DataObject;

        const pageData = await getBITableList<BaseArticle>({
          database: ARTICLE_LARK_BASE_ID,
          table: ARTICLE_LARK_TABLE_ID,
          page_size,
          page_token,
         filter: makeFilter({ kId: body }, 'OR'),
        });

        response.json(pageData.items);
      }
    }
  },
);
