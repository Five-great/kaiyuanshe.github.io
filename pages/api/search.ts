import { parseURLData } from 'web-utility';
import { NextApiResponse } from 'next';

import { safeAPI } from './base';
import {
  ARTICLE_LARK_BASE_ID,
  ARTICLE_LARK_TABLE_ID,
  ARTICLE_I18N_LARK_TABLE_ID,
  getBITableList,
  LARK_BITABLE_GROUP_ID,
  LARK_BITABLE_MEMBERS_ID,
  LARK_BITABLE_ORGANIZATION_ID,
  LARK_BITABLE_ACTIVITY_ID,
  LARK_BITABLE_ID,
  makeFilter,
} from '../../models/Lark';
import { BaseArticle, BaseArticleI18n } from './article';
import { Member } from '../../models/Member';
import { Group } from '../../models/Group';
import { Organization } from '../../models/Organization';
import type { Activity } from '../../pages/api/activity';
import { ArticleI18n, getArticleI18nList, normalizeArray } from '../../models/ArticleI18n';

export type SearchQuery = Partial<Record<'keywords' | 'tag', string>>;

export interface SearchResult {
  activities: Activity[],
  articles: ArticleI18n[];
  members: Member[];
  groups: Group[];
  organizations: Organization[];
}

export default safeAPI(
  async ({ method, url }, response: NextApiResponse<SearchResult>) => {
    switch (method) {
      case 'GET': {
        const { keywords, tag } = parseURLData(url) as SearchQuery;
        const keywordList = keywords?.split(/\s+/);
        var articlesI18n: ArticleI18n[] = []
        if (keywordList || tag)
          var [
            { items: articlesI18nItems },
            { items: activities },
            { items: groups },
            { items: organizations },
          ] = await Promise.all([
            getBITableList<BaseArticleI18n>({
              database: ARTICLE_LARK_BASE_ID,
              table: ARTICLE_I18N_LARK_TABLE_ID,
              page_size: 40,
              filter: makeFilter(
                {
                  aritclesText: keywordList,
                  author: keywordList,
                  tagsText: tag,
                  alias: keywordList,
                },
                'OR',
              ),
            }),
            getBITableList<Activity>({
              database: LARK_BITABLE_ID,
              table: LARK_BITABLE_ACTIVITY_ID,
              filter: makeFilter(
                {
                  name: keywordList,
                  city: keywordList,
                  location: keywordList,
                  organizers: tag,
                },
                'OR',
              ),
            }),
            getBITableList<Group>({
              table: LARK_BITABLE_GROUP_ID,
              filter: makeFilter(
                {
                  fullName: keywordList,
                  leader: keywordList,
                  members: keywordList,
                  tags: tag,
                  summary: keywordList,
                  link: keywordList,
                  codeLink: keywordList,
                },
                'OR',
              ),
            }),
            getBITableList<Organization>({
              table: LARK_BITABLE_ORGANIZATION_ID,
              filter: makeFilter(
                {
                  name: keywordList,
                  tags: tag,
                  summary: keywordList,
                  city: keywordList,
                  link: keywordList,
                  codeLink: keywordList,
                  wechatName: keywordList,
                },
                'OR',
              ),
            }),
          ]);

        if (keywordList)
          var { items: members } = await getBITableList<Member>({
            table: LARK_BITABLE_MEMBERS_ID,
            filter: makeFilter(
              { name: keywordList, nickname: keywordList },
              'OR',
            ),
          });

          // @ts-ignore
         if(articlesI18nItems){
          const ArticleKIdsData:Record<string,BaseArticleI18n> = {}
          const ArticleKids: string[] = [];
          articlesI18nItems.map(item=>{
            ArticleKids.push(item.fields.kId as string)
            item.fields.langs = normalizeArray(item.fields.langs);
            ArticleKIdsData[item.fields.kId as string] = item.fields
          })
          const { items:articleData } = await getBITableList<BaseArticle>({
            database: ARTICLE_LARK_BASE_ID,
            table: ARTICLE_LARK_TABLE_ID,
            filter: makeFilter({ kId: ArticleKids }, 'OR'),
          });
         // @ts-ignore
          articlesI18n = getArticleI18nList(articleData,ArticleKids,ArticleKIdsData)
         }
        response.json({
          articles:
            // @ts-ignore
            articlesI18n || [],
          activities:
            // @ts-ignore
            activities?.map(({ id, fields }) => ({...fields, id: id! })) || [],
          members:
            // @ts-ignore
            members?.map(({ id, fields }) => ({ ...fields, id: id! })) || [],
          groups:
            // @ts-ignore
            groups?.map(({ id, fields }) => ({ ...fields, id: id! })) || [],
          organizations:
            // @ts-ignore
            organizations
              ?.filter(({ fields: { verified } }) => verified === '是')
              .map(({ id, fields }) => ({ ...fields, id: id! })) || [],
        });
      }
    }
  },
);
