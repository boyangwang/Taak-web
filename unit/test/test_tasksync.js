var assert = require("assert");
require("../../src/js/client.sync.js");

describe('Sync', function(){
	describe('#setLocal', function(){
		it('should convert object to array', function(){
			var sync = new TaskSync();
			var entries = { };
			entries["1"] = {id:"1",time:Date.now(),value:"test"};
			entries["23"] = {id:"23",time:Date.now(),value:"test2"};
			sync.setLocal(entries);
			assert.equal(sync.localCopy[0], entries["1"]);
			assert.equal(sync.localCopy[1], entries["23"]);
		})
	});
	describe('#setRemote', function(){
		it('should convert object to array', function(){
			var sync = new TaskSync();
			var entries = { };
			entries["1"] = {id:"1",time:Date.now(),value:"test"};
			entries["23"] = {id:"23",time:Date.now(),value:"test2"};
			sync.setRemote(entries);
			assert.equal(sync.remoteCopy[0], entries["1"]);
			assert.equal(sync.remoteCopy[1], entries["23"]);
		})
	});
	describe('#merge', function(){
		it('should merge both copies', function(){
			var sync = new TaskSync();
			var time1 = Date.now() - 100;
			var time2 = Date.now();
			var time3 = Date.now() + 100;
			var local = { };
			local["1"] = {id:"1",time:time2,value:"test1"}; // client newer
			local["23"] = {id:"23",time:time1,value:"test2"};
			local["24"] = {id:"24",time:time2,value:"test3"};
			local["26"] = {id:"26",time:time2,value:"test7"}; // add by client
			
			var remote = { };
			remote["1"] = {id:"1",time:time1,value:"test4"};
			remote["23"] = {id:"23",time:time2,value:""}; // mark for delete
			remote["24"] = {id:"24",time:time3,value:"test5"}; // server newer
			remote["25"] = {id:"25",time:time3,value:"test6"}; // add by server
			
			sync.setLocal(local);
			sync.setRemote(remote);
			
			var expected = [local["1"],remote["23"],remote["24"],remote["25"],local["26"]];
			var result = sync.merge();
			
			assert.equal(result.length, expected.length);
			for (var i = 0; i < expected.length; i++) {
				assert.equal(result[i], expected[i]);
			}
		})
	});
	describe('#synchronize', function(){
		it('should find differences with server copy', function(){
			var sync = new TaskSync();
			var time1 = Date.now() - 100;
			var time2 = Date.now();
			var time3 = Date.now() + 100;
			var local = { };
			local["1"] = {id:"1",time:time2,value:"test1"}; // client newer
			local["23"] = {id:"23",time:time1,value:"test2"};
			local["24"] = {id:"24",time:time2,value:"test3"};
			local["26"] = {id:"26",time:time2,value:"test7"}; // add by client
			
			var remote = { };
			remote["1"] = {id:"1",time:time1,value:"test4"};
			remote["23"] = {id:"23",time:time2,value:""}; // mark for delete by server
			remote["24"] = {id:"24",time:time3,value:"test5"}; // server newer
			remote["25"] = {id:"25",time:time3,value:"test6"}; // add by server
			
			sync.setLocal(local);
			sync.setRemote(remote);
			
			//var expected = [local["1"],remote["23"],remote["24"],remote["25"],local["26"]];
			var expected = { };
			expected["1"] = local["1"];
			// 23 not included as it is deleted
			expected["24"] = remote["24"];
			expected["25"] = remote["25"];
			expected["26"] = local["26"];
			
			var result = sync.synchronize();
			// Check from expected perspective
			for (var entry in expected) {
				assert.equal(expected[entry], result[entry]);
			}
			// Check from result perspective
			for (var entry in result) {
				assert.equal(expected[entry], result[entry]);
			}
			
			var expectedPUT = { };
			expectedPUT["1"] = local["1"];
			expectedPUT["1"].sync = true;
			expectedPUT["26"] = local["26"];
			expectedPUT["26"].sync = true;
			
			// Check from expected perspective
			for (var entry in expectedPUT) {
				assert.equal(expectedPUT[entry], sync.pendingPUT[entry]);
			}
			
			// Check from result perspective
			for (var entry in sync.pendingPUT) {
				assert.equal(expectedPUT[entry], sync.pendingPUT[entry]);
			}

		})
	});
});
