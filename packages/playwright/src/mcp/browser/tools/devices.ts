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
import { defineTool } from './tool';
import { z } from '../../sdk/bundle';
import type { Context } from 'playwright/lib/mcp/browser/context';
import type { Response } from 'playwright/lib/mcp/browser/response';


const listDevices = defineTool({
  capability: 'core',
  schema: {
    name: 'device_list',
    title: 'List all devices available',
    description: 'List all devices available',
    inputSchema: z.object({}),
    type: 'action'
  },
  handle: async (context: Context, p, response: Response) => {
    response.addResult(JSON.stringify(devices));
  },
});


const switchDevice = defineTool({
  capability: 'core',
  schema: {
    name: 'device_switch',
    title: 'Switch device',
    description: 'Switch device',
    inputSchema: z.object({
      device: z.string().optional().describe('Device name to emulate (e.g., "iPhone 13", "Pixel 5")'),
    }),
    type: 'action'
  },
  handle: async (context: Context, params, response: Response) => {
    let needSwitch = false;
    if (params.device) {
      if (params.device in devices)
        needSwitch = await context.switchContext(devices[params.device]);
      else
        throw new Error(`Device ${params.device} NOT Found.`);
    }
    if (needSwitch)
      response.addCode(`await context.switchContext(${params.device})`);
    else
      response.addCode(`OK`);
  },
});

export default [
  listDevices,
  switchDevice
];
