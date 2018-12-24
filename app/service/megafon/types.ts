/**
 * Метод SignDocument предназначен для подписания произвольных документов, с использованием МЭП
 *
 * @export
 * @interface ISignDocument
 */
export interface ISignDocument {
  /**
   * Мобильный номер SIM карты клиента с ЭП (обязательно для указания, если не указана transacrionId, совместно не используются)
   *
   * @type {string}
   * @memberof ISignDocument
   */
  msisdn: string;
  /**
   * Текст, который будет отображен на Мобильном Устройстве Абонента при подписании документа
   *
   * @type {string}
   * @memberof ISignDocument
   */
  text: string;
  /**
   * Подписываемый документ (накладная, договор, скан и т.п.), передается в виде Base64
   *
   * @type {string}
   * @memberof ISignDocument
   */
  document: string;

  /**
   * Тип подписи. Возможные значения:  • Attached – прикрепленная подпись  • Detached – открепленная подпись
   *
   * @type {string}
   * @memberof ISignDocument
   */
  signType?: string;
  /**
   * специфицируемая «свертка» от документа (8 шестнадцатеричных символов)
   *
   * @type {string}
   * @memberof ISignDocument
   */
  digest: string;
}

/**
 * Метод SignText предназначен для подписания коротких текстов, с использованием МЭП
 *
 * @export
 * @interface ISignText
 */
export interface ISignText {
  /**
   * Мобильный номер SIM карты клиента с ЭП (обязательно для указания, если не указана transacrionId, совместно не используются)
   *
   * @type {string}
   * @memberof ISignText
   */
  msisdn: string;
  /**
   * Подписываемый текст.
   * Этот же текст будет отображен на Мобильном Устройстве Абонента
   *
   * @type {string}
   * @memberof ISignText
   */
  text: string;
  /**
   * Тип подписи. Возможные значения:  • Attached – прикрепленная подпись  • Detached – открепленная подпись
   *
   * @type {string}
   * @memberof ISignText
   */
  signType?: string;
}

/**
 * Метод GetSignStatus предназначен для получения статуса подписания, при pull стратегии нотификации. Тип нотификации задается при регистрации Сервис Провайдера в Платформе МЭП
 *
 * @export
 * @interface IGetSignStatus
 */
export interface IGetSignStatus {
  /**
   * Уникальный идентификатор транзакции
   *
   * @type {string}
   * @memberof IGetSignStatus
   */
  transaction_id: string;
}

/**
 * Метод осуществляет проверку подлинности подписанного документа
 *
 * @export
 * @interface IVerify
 */
export interface IVerify {
  /**
   * Документ для проверки.
   * Передается в виде Base64
   *
   * @type {string}
   * @memberof IVerify
   */
  document: string;
  /**
   * Подпись документа. Данный параметр необязательный, в случае attached подписи и обязательный, в случае detached подписи.
   * Передается в виде Base64
   *
   * @type {string}
   * @memberof IVerify
   */
  signature?: string;
}

/**
 * Тип данных DocumentData
 *
 * @export
 * @interface IDocumentData
 */
export interface IDocumentData {
  /**
   * Подписываемый документ (накладная, договор, скан и т.п.), передается в виде Base64
   *
   * @type {string}
   * @memberof IDocumentData
   */
  document: string;
  /**
   * Специфицируемая «свертка» от документа (8 шестнадцатеричных символов)
   *
   * @type {string}
   * @memberof IDocumentData
   */
  digest: string;
}

/**
 * Метод multiplysign осуществляет подписание одного или нескольких документов
 *
 * @export
 * @interface IMultiplysign
 */
export interface IMultiplysign {
  /**
   * Мобильный номер SIM карты клиента с ЭП (обязательно для указания, если не указана transacrionId, совместно не используются)
   *
   * @type {string}
   * @memberof ISignDocument
   */
  msisdn: string;
  /**
   * Текст, который будет отображен на Мобильном Устройстве Абонента при подписании документа
   *
   * @type {string}
   * @memberof ISignDocument
   */
  text: string;
  /**
   * Список документов, содержащий объекты типа DocumentData
   *
   * @type {IDocumentData[]}
   * @memberof IMultiplysign
   */
  documentList: IDocumentData[];
  /**
   * Тип подписи. Возможные значения:  • Attached – прикрепленная подпись  • Detached – открепленная подпись
   *
   * @type {string}
   * @memberof ISignDocument
   */
  signType?: string;
}
