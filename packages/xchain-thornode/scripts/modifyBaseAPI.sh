#!/bin/sh

#  NOTE: the follwiing bit of code needs to be inserted in the configuration class after autogeneration

#             this.basePath = configuration.basePath || this.basePath;
#             if(this.basePath.includes('thornode.ninerealms.com')){
#               if(!this.configuration.baseOptions) this.configuration.baseOptions = {}
#               if(!this.configuration.baseOptions.headers) this.configuration.baseOptions.headers = {}
#               if(!this.configuration.baseOptions.headers['x-client-id']) this.configuration.baseOptions.headers['x-client-id'] = 'xchainjs-client'
#             }

TO_INSERT_WITH_LINES_REMOVED="this.basePath = configuration.basePath || this.basePath; if(this.basePath.includes('thornode.ninerealms.com')){if(!this.configuration.baseOptions) this.configuration.baseOptions = {};if(!this.configuration.baseOptions.headers) this.configuration.baseOptions.headers = {};if(!this.configuration.baseOptions.headers['x-client-id']) this.configuration.baseOptions.headers['x-client-id'] = 'xchainjs-client';}"
# TODO find a different implementation that doesnt remove all the new lines in the string

sed -i '' "s/this.basePath = configuration.basePath || this.basePath;/$TO_INSERT_WITH_LINES_REMOVED/" src/generated/thornodeApi/base.ts





