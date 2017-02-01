'use strict';

var trusted = require('trusted-crypto');

(function() {
  var items;

  /**
   * Init certificate store
   */
  function initStore() {
    var store;
    var providerSystem;

    providerSystem = new trusted.pkistore.Provider_System(DEFAULT_CERTSTORE_PATH);

    store = new trusted.pkistore.PkiStore(DEFAULT_CERTSTORE_PATH + '/cash.json');
    store.addProvider(providerSystem.handle);
    items = store.cash.export();
  }

  initStore();

  window.__pkiItemsLoadCallback(items);
})();

