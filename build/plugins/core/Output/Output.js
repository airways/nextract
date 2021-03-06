'use strict';

var _JSONStream = require('JSONStream');

var _JSONStream2 = _interopRequireDefault(_JSONStream);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _csv = require('csv');

var _csv2 = _interopRequireDefault(_csv);

var _pluginBase = require('../../pluginBase');

var _pluginBase2 = _interopRequireDefault(_pluginBase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//Instantiate the plugin
/**
 * Mixes in methods used to export files
 *
 * @class Nextract.Plugins.Core.Output
 */

/*
TODO:
2) Implement excel writer
*/

var outputPlugin = new _pluginBase2.default('Input', 'Core');

module.exports = {

  /**
   * Converts stream objects to csv strings (usually paired with toFile).
   *
   * @method toCsvString
   * @for Nextract.Plugins.Core.Output
   *
   * @example
   *     var formattingConfig = { headers: true, columns: { first_name: 'first_name', last_name: 'last_name', ... } };
   * @example
   *     transform.Plugins.Core.Output.toCsvString(formattingConfig);
   *
   * @param {Object} formattingConfig Object contain config options for the file type being written.
   * All options allowed by cvs-stringify (http://csv.adaltas.com/stringify/) are supported.
   *
   * @return {String} Returns a string formatted as a CSV
   */
  toCsvString: function toCsvString() {
    var formattingConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var stringifier = _csv2.default.stringify(formattingConfig);

    return outputPlugin.getStreamPassthroughForPipe().pipe(stringifier);
  },

  /**
   * Converts stream objects to JSON strings (usually paired with toFile).
   *
   * @method toJsonString
   * @for Nextract.Plugins.Core.Output
   *
   * @example
   *     transform.Plugins.Core.Output.toJsonString(true);
   *
   * @param {Boolean} wrapJsonArray (defaults to true)
   * @param {String} open Custom opening string placed before JSON array. Defaults to '{\n\t"data": [\n\t'.
   * @param {String} close Custom close string placed after JSON array. Defaults to ',\n\t'.
   * @param {String} seperator Custom seperator places between array object elements. Defaults to '\n\t]\n}\n'.
   *
   * @return {String} Returns a string formatted as JSON
   */
  toJsonString: function toJsonString() {
    var wrapJsonArray = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    var open = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '{\n\t"data": [\n\t';
    var close = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ',\n\t';
    var seperator = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '\n\t]\n}\n';

    if (wrapJsonArray === true) {
      return outputPlugin.getStreamPassthroughForPipe().pipe(_JSONStream2.default.stringify(open, close, seperator));
    } else {
      return outputPlugin.getStreamPassthroughForPipe().pipe(_JSONStream2.default.stringify(false));
    }
  },

  /**
   * Writes stream to a file (usually preceeded by a call to toCsv, toExcel, toJSON, etc). Use the
   * stream finish event to know when the write is done. An end event is not not emitted.
   *
   * @method toFile
   * @for Nextract.Plugins.Core.Output
   *
   * @example
   *     var outputFilePath = '/path/to/file.extension';
   * @example
   *     transform.Plugins.Core.Output.toFile(outputFilePath);
   *
   * @param {Object} formattingConfig Object contain config options for the file type being written.
   * All options allowed by cvs-stringify (http://csv.adaltas.com/stringify/) are supported.
   */
  toFile: function toFile(filePath) {
    var writeStream = _fs2.default.createWriteStream(filePath);

    //An end event is not triggered on fs.createWriteStream, but a finish event is. We want to force an
    //end event so that all transforms are consistent and have a chance to to cleanup with finish and end
    //events.
    writeStream.on('finish', function () {
      //Give the finish event a moment to be handled before firing end. Otherwise the transforms end event
      //will actually be called before the finish event.
      setTimeout(function () {
        writeStream.emit('end');
      }, 10);
    });

    return outputPlugin.getStreamPassthroughForPipe().pipe(writeStream);
  }

};
