/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

(function(document) {
  'use strict';

  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  var app = document.querySelector('#app');

  app.displayInstalledToast = function() {
    document.querySelector('#caching-complete').show();
  };

  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
  app.addEventListener('dom-change', function() {
    console.log('Our app is ready to rock!');
  });

  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function() {
    var db = openDatabase('quizFifaApp', '1.0', 'quizFifaApp', 10000000);
    db.transaction( function (tx){
        tx.executeSql('CREATE TABLE IF NOT EXISTS CONFIGURACAO (NOVA_INSTALACAO CHAR (1, 1) NOT NULL);',
          [],
          tableConfigOk(db),
          errorHandler);
      });
  });

  function tableConfigOk(db) {
    db.transaction( function (tx){
      tx.executeSql('SELECT NOVA_INSTALACAO FROM CONFIGURACAO;',
        [],
        verificaBanco,
        errorHandler);
    });
  }

  function verificaBanco(tx, results) {
    if (results.rows.length === 0) {
      app.route = "loading";
      var db = openDatabase('quizFifaApp', '1.0', 'quizFifaApp', 10000000);
      $.get('database/quizFifaApp.sql', function (response) {
        processQuery(db, 2, response.split(';\n'), 'quizFifaApp');
      });
    } else {
      app.route = "home";
    }
  }

  function processQuery(db, i, queries, dbname) {
    if(i < queries.length -1) {
      if(!queries[i+1].match(/(INSERT|CREATE|DROP|PRAGMA|BEGIN|COMMIT)/)) {
        queries[i+1] = queries[i]+ ';\n' + queries[i+1];
        return processQuery(db, i+1, queries, dbname);
      }
      db.transaction( function (query){
        query.executeSql(queries[i]+';', [], function(tx, result) {
          processQuery(db, i +1, queries,dbname);
        });
      }, function(err) {
        processQuery(db, i +1, queries, dbname);
      });
    } else {
      app.route = "home";
    }
  }

  function errorHandler(transaction, error) {
    console.log('Oops.  Error was '+error.message+' (Code '+error.code+')');
    var we_think_this_error_is_fatal = true;
    if (we_think_this_error_is_fatal) { return true; }
    return false;
  }

  addEventListener('paper-header-transform', function(e) {
    var appName = document.querySelector('.app-name');
    var middleContainer = document.querySelector('.middle-container');
    var bottomContainer = document.querySelector('.bottom-container');
    var detail = e.detail;
    var heightDiff = detail.height - detail.condensedHeight;
    var yRatio = Math.min(1, detail.y / heightDiff);
    var maxMiddleScale = 0.50;  // appName max size when condensed. The smaller the number the smaller the condensed size.
    var scaleMiddle = Math.max(maxMiddleScale, (heightDiff - detail.y) / (heightDiff / (1-maxMiddleScale))  + maxMiddleScale);
    var scaleBottom = 1 - yRatio;

    Polymer.Base.transform('translate3d(0,' + yRatio * 100 + '%,0)', middleContainer);

    Polymer.Base.transform('scale(' + scaleBottom + ') translateZ(0)', bottomContainer);

    Polymer.Base.transform('scale(' + scaleMiddle + ') translateZ(0)', appName);
  });




})(document);
