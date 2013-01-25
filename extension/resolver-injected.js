var _ARN_VALUES_MAP = {
  'string'     : 'strings.xml',
  'color'      : 'colors.xml',
  'style'      : 'styles.xml',
  'dimen'      : 'dimens.xml',
  'bool'       : 'bools.xml',
  'id'         : 'ids.xml',
  'attr'       : 'attrs.xml',
  'integer'    : 'integers.xml',
  'array'      : 'arrays.xml'
};

function arn_resolve(s) {

  var url = window.location.href;
  var resPath = s.replace('android:', '');
  var resName = resPath.slice(resPath.lastIndexOf('/')+1, resPath.length);
  var resType = resPath.slice(0, resPath.indexOf('/'));
  var urlBase = url.slice(0, url.lastIndexOf('/res')+5);
  var xmlUrl = urlBase + resPath + ".xml";
  var project = url.split('/')[3] + '/' + url.split('/')[4]; // user/project

  console.log(resType);

  //alert(project);
  var valuesMap = arn_getValuesMap(project);

  if (resType in valuesMap) {
    // in values bucket
    var loc = urlBase + 'values/' + valuesMap[resType];
    var inPage = (loc === window.location.href.split('#')[0]); // target is current page
    
    if (inPage) {
	  arn_findResourceInPage(resName); // page-find-injected.js
    } else {
      window.location.href = loc + '##' + resName;
    }

  } else if (resType === 'drawable') {
    // drawable
	// try xml
    arn_checkTarget(xmlUrl,
      function() {
        window.location.href = xmlUrl;
      },
      function() {
		// try 9 patch
        var pathHdpi = resPath.replace('drawable', 'drawable-hdpi');
        var nineUrl = urlBase + pathHdpi + ".9.png";
        var pngUrl = urlBase + pathHdpi + ".png";
        arn_checkTarget(nineUrl,
          function() {
            window.location.href = nineUrl;
          },
          function() {
            // regular png
	        window.location.href = pngUrl;
          }
        );
      }
    );
  } else {
    // other
    window.location.href = xmlUrl;
  }

}

function arn_getValuesMap(project) {
  if (_ARN_VALUES_OVERRIDES) { // injected
    for (var key in _ARN_VALUES_OVERRIDES) {
      if (_ARN_VALUES_OVERRIDES.hasOwnProperty(key)) {
        //alert(key + " -> " + _ARN_VALUES_OVERRIDES[key]);
        var re = new RegExp();
        re.compile(key);
        if (project.match(re)) {
          return _ARN_VALUES_OVERRIDES[key];
        }
      }
    }
  }
  return _ARN_VALUES_MAP;
}

function arn_checkTarget(targetUrl, functionOk, functionFail) {
  $.ajax({
    url: targetUrl,
    statusCode: {
      404: functionFail,
      200: functionOk
    }
//  }).done(function() {
//    alert("done");
  });
}
