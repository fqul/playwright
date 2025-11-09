/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { devices } from 'playwright-core';
import { z } from '../../sdk/bundle';
import { defineTool, defineTabTool } from './tool';

const navigate = defineTool({
  capability: 'core',

  schema: {
    name: 'browser_navigate',
    title: 'Navigate to a URL',
    description: 'Navigate to a URL',
    inputSchema: z.object({
      url: z.string().describe('The URL to navigate to'),
      device: z.string().optional().describe('Device name to emulate (e.g., "iPhone 13", "Pixel 5")'),
    }),
    type: 'action',
  },

  handle: async (context, params, response) => {
    let needSwitch = false;
    if (params.device) {
      if (params.device in devices)
        needSwitch = await context.switchContext(devices[params.device]);
      else
        throw new Error(`Device ${params.device} NOT Found.`);
    }

    if (needSwitch && context.currentTab())
      await context.newTab();


    const tab = await context.ensureTab();
    await tab.navigate(params.url);

    response.setIncludeSnapshot();
    response.addCode(`await page.goto('${params.url}');`);
  },
});

const goBack = defineTabTool({
  capability: 'core',
  schema: {
    name: 'browser_navigate_back',
    title: 'Go back',
    description: 'Go back to the previous page',
    inputSchema: z.object({}),
    type: 'action',
  },

  handle: async (tab, params, response) => {
    await tab.page.goBack();
    response.setIncludeSnapshot();
    response.addCode(`await page.goBack();`);
  },
});

export default [
  navigate,
  goBack,
];
