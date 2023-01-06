import { NewData, ListModel, Stream, toggle } from 'mobx-restful';
import { TableCellValue } from 'lark-ts-sdk';
import { observable } from 'mobx';

import { client } from './Base';
import { createListStream } from './Lark';
import { BaseArticle , BaseArticleI18n } from '../pages/api/article';
import { i18n } from '../models/Translation';

export interface Article extends BaseArticle {
  content: string;
}

export interface ArticleI18n extends BaseArticleI18n {
  articlesData: Record<string,Article>;
}

const normalizeArrayToValue = (
  array: TableCellValue,
  key: string
) =>{
  const value = (array as unknown as Array<Record<string,string>>)[0];
  return value && typeof value === 'object' && key in value ? value[key] : '';
};

export const normalizeArray = (array: TableCellValue,key:string = "text")=>array&&(array as Array<any>).map(item=>item[key]).join('').split(',');

const normalize = ({
  id,
  fields,
}: {
  id?: TableCellValue;
  fields: BaseArticle;
}): BaseArticle => ({
  ...fields,
  id: id!,
});

export const getArticleI18nList = (items: { id?: string | undefined; record_id: string; fields: BaseArticle; }[] | undefined,kIds: string[],ArticleKIdsData: Record<string, BaseArticleI18n>)=>{
  let articleData: Record<string,Record<string,BaseArticle>> = {}
  items!.map(item=>{
    (articleData[item.fields.kId as string] ||= {})[normalizeArrayToValue(item.fields.langCode,"text")] = normalize(item);
  })
  const articleI18nList = [];
  for(let key of kIds) articleI18nList.push({...ArticleKIdsData[key],articlesData: articleData[key]})
  
  return articleI18nList;
}

export const getArticleList = (list:ArticleI18n[])=>{
  const { currentLanguage } =  i18n;
  const articleList = [];
   for(let item of list){
     articleList.push(item.articlesData[currentLanguage]||item.articlesData[(item.langs as string[])[0]])
   }
 
   return articleList;
   
 }

export class ArticleI18nModel extends Stream<ArticleI18n>(ListModel) {
  client = client;
  baseURI = 'article';
  ArticleKIdsData:Record<string,BaseArticleI18n> = {}

  @observable
  currentRecommend: ArticleI18n[] = [];

  async *openStream(filter: NewData<BaseArticleI18n>) {
    for await (const { total, items } of createListStream<BaseArticleI18n>(
      this.client,
      this.baseURI,
      filter,
    )) {
      this.totalCount = total;

      const ArticleKids: string[] = [];
      items.map(item=>{
        ArticleKids.push(item.fields.kId as string)
        item.fields.langs = normalizeArray(item.fields.langs);
        this.ArticleKIdsData[item.fields.kId as string] = item.fields
      })

      const newItems = await this.getArticleByKId(ArticleKids)

      yield * newItems as unknown as ArticleI18n[]
    }
  }

  async getArticleByKId(kIds:string[]){

    const { body } = await this.client.post<{
      id?: string | undefined;
      record_id: string;
      fields: BaseArticle;
     }[]>(
        `${this.baseURI}/articlebykid`,
        kIds
      );
    return getArticleI18nList(body,kIds,this.ArticleKIdsData)
  }

  @toggle('downloading')
  async getArticleOne(id: string,langCode: string) {
      const { body } = await this.client.get<Article>(`${this.baseURI}/${id}?lang=${langCode}`);
      return body;
  }

  @toggle('downloading')
  async getRecommendList(alias: string,langCode:string) {
    const { body } = await this.client.get<BaseArticleI18n[]>(
      `${this.baseURI}/${alias}/recommend?lang=${langCode}`,
    );
    return (this.currentRecommend = body! as unknown as ArticleI18n[]);
  }
}

export default new ArticleI18nModel();
