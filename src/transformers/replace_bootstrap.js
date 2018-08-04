"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const path_1 = require("path");
const ts = require("typescript");
const ast_helpers_1 = require("./ast_helpers");
const insert_import_1 = require("./insert_import");
const interfaces_1 = require("./interfaces");
const make_transform_1 = require("./make_transform");
function replaceBootstrap(shouldTransform, getEntryModule, getTypeChecker) {
    const standardTransform = function (sourceFile) {
        const ops = [];
        const entryModule = getEntryModule();
        if (!shouldTransform(sourceFile.fileName) || !entryModule) {
            return ops;
        }
        // Find all identifiers.
        const entryModuleIdentifiers = ast_helpers_1.collectDeepNodes(sourceFile, ts.SyntaxKind.Identifier)
            .filter(identifier => identifier.text === entryModule.className);
        if (entryModuleIdentifiers.length === 0) {
            return [];
        }
        const relativeEntryModulePath = path_1.relative(path_1.dirname(sourceFile.fileName), entryModule.path);
        const normalizedEntryModulePath = `./${relativeEntryModulePath}`.replace(/\\/g, '/');
        // Find the bootstrap calls.
        entryModuleIdentifiers.forEach(entryModuleIdentifier => {
            // Figure out if it's a `platformBrowserDynamic().bootstrapModule(AppModule)` call.
            if (!(entryModuleIdentifier.parent
                && entryModuleIdentifier.parent.kind === ts.SyntaxKind.CallExpression)) {
                return;
            }
            const callExpr = entryModuleIdentifier.parent;
            if (callExpr.expression.kind !== ts.SyntaxKind.PropertyAccessExpression) {
                return;
            }
            const propAccessExpr = callExpr.expression;
            if (propAccessExpr.name.text !== 'bootstrapModule'
                || propAccessExpr.expression.kind !== ts.SyntaxKind.CallExpression) {
                return;
            }
            const bootstrapModuleIdentifier = propAccessExpr.name;
            const innerCallExpr = propAccessExpr.expression;
            if (!(innerCallExpr.expression.kind === ts.SyntaxKind.Identifier
                && innerCallExpr.expression.text === 'platformBrowserDynamic')) {
                return;
            }
            const platformBrowserDynamicIdentifier = innerCallExpr.expression;
            const idPlatformBrowser = ts.createUniqueName('__NgCli_bootstrap_');
            const idNgFactory = ts.createUniqueName('__NgCli_bootstrap_');
            // Add the transform operations.
            const factoryClassName = entryModule.className + 'NgFactory';
            const factoryModulePath = normalizedEntryModulePath + '.ngfactory';
            ops.push(
            // Replace the entry module import.
            ...insert_import_1.insertStarImport(sourceFile, idNgFactory, factoryModulePath), new interfaces_1.ReplaceNodeOperation(sourceFile, entryModuleIdentifier, ts.createPropertyAccess(idNgFactory, ts.createIdentifier(factoryClassName))), 
            // Replace the platformBrowserDynamic import.
            ...insert_import_1.insertStarImport(sourceFile, idPlatformBrowser, '@angular/platform-browser'), new interfaces_1.ReplaceNodeOperation(sourceFile, platformBrowserDynamicIdentifier, ts.createPropertyAccess(idPlatformBrowser, 'platformBrowser')), new interfaces_1.ReplaceNodeOperation(sourceFile, bootstrapModuleIdentifier, ts.createIdentifier('bootstrapModuleFactory')));
        });
        return ops;
    };
    return make_transform_1.makeTransform(standardTransform, getTypeChecker);
}
exports.replaceBootstrap = replaceBootstrap;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwbGFjZV9ib290c3RyYXAuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL25ndG9vbHMvd2VicGFjay9zcmMvdHJhbnNmb3JtZXJzL3JlcGxhY2VfYm9vdHN0cmFwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsK0JBQXlDO0FBQ3pDLGlDQUFpQztBQUNqQywrQ0FBaUQ7QUFDakQsbURBQW1EO0FBQ25ELDZDQUEyRjtBQUMzRixxREFBaUQ7QUFHakQsMEJBQ0UsZUFBOEMsRUFDOUMsY0FBZ0UsRUFDaEUsY0FBb0M7SUFHcEMsTUFBTSxpQkFBaUIsR0FBc0IsVUFBVSxVQUF5QjtRQUM5RSxNQUFNLEdBQUcsR0FBeUIsRUFBRSxDQUFDO1FBRXJDLE1BQU0sV0FBVyxHQUFHLGNBQWMsRUFBRSxDQUFDO1FBRXJDLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3pELE9BQU8sR0FBRyxDQUFDO1NBQ1o7UUFFRCx3QkFBd0I7UUFDeEIsTUFBTSxzQkFBc0IsR0FBRyw4QkFBZ0IsQ0FBZ0IsVUFBVSxFQUN2RSxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQzthQUN4QixNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFLLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVuRSxJQUFJLHNCQUFzQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDdkMsT0FBTyxFQUFFLENBQUM7U0FDWDtRQUVELE1BQU0sdUJBQXVCLEdBQUcsZUFBUSxDQUFDLGNBQU8sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pGLE1BQU0seUJBQXlCLEdBQUcsS0FBSyx1QkFBdUIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFckYsNEJBQTRCO1FBQzVCLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFO1lBQ3JELG1GQUFtRjtZQUNuRixJQUFJLENBQUMsQ0FDSCxxQkFBcUIsQ0FBQyxNQUFNO21CQUN6QixxQkFBcUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUN0RSxFQUFFO2dCQUNELE9BQU87YUFDUjtZQUVELE1BQU0sUUFBUSxHQUFHLHFCQUFxQixDQUFDLE1BQTJCLENBQUM7WUFFbkUsSUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLHdCQUF3QixFQUFFO2dCQUN2RSxPQUFPO2FBQ1I7WUFFRCxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsVUFBeUMsQ0FBQztZQUUxRSxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLGlCQUFpQjttQkFDN0MsY0FBYyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUU7Z0JBQ3BFLE9BQU87YUFDUjtZQUVELE1BQU0seUJBQXlCLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQztZQUN0RCxNQUFNLGFBQWEsR0FBRyxjQUFjLENBQUMsVUFBK0IsQ0FBQztZQUVyRSxJQUFJLENBQUMsQ0FDSCxhQUFhLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVU7bUJBQ3RELGFBQWEsQ0FBQyxVQUE0QixDQUFDLElBQUksS0FBSyx3QkFBd0IsQ0FDakYsRUFBRTtnQkFDRCxPQUFPO2FBQ1I7WUFFRCxNQUFNLGdDQUFnQyxHQUFHLGFBQWEsQ0FBQyxVQUEyQixDQUFDO1lBRW5GLE1BQU0saUJBQWlCLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDcEUsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFFOUQsZ0NBQWdDO1lBQ2hDLE1BQU0sZ0JBQWdCLEdBQUcsV0FBVyxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUM7WUFDN0QsTUFBTSxpQkFBaUIsR0FBRyx5QkFBeUIsR0FBRyxZQUFZLENBQUM7WUFDbkUsR0FBRyxDQUFDLElBQUk7WUFDTixtQ0FBbUM7WUFDbkMsR0FBRyxnQ0FBZ0IsQ0FBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixDQUFDLEVBQy9ELElBQUksaUNBQW9CLENBQUMsVUFBVSxFQUFFLHFCQUFxQixFQUN4RCxFQUFFLENBQUMsb0JBQW9CLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDOUUsNkNBQTZDO1lBQzdDLEdBQUcsZ0NBQWdCLENBQUMsVUFBVSxFQUFFLGlCQUFpQixFQUFFLDJCQUEyQixDQUFDLEVBQy9FLElBQUksaUNBQW9CLENBQUMsVUFBVSxFQUFFLGdDQUFnQyxFQUNuRSxFQUFFLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxFQUNoRSxJQUFJLGlDQUFvQixDQUFDLFVBQVUsRUFBRSx5QkFBeUIsRUFDNUQsRUFBRSxDQUFDLGdCQUFnQixDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FDakQsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDLENBQUM7SUFFRixPQUFPLDhCQUFhLENBQUMsaUJBQWlCLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDMUQsQ0FBQztBQXRGRCw0Q0FzRkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBkaXJuYW1lLCByZWxhdGl2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5pbXBvcnQgeyBjb2xsZWN0RGVlcE5vZGVzIH0gZnJvbSAnLi9hc3RfaGVscGVycyc7XG5pbXBvcnQgeyBpbnNlcnRTdGFySW1wb3J0IH0gZnJvbSAnLi9pbnNlcnRfaW1wb3J0JztcbmltcG9ydCB7IFJlcGxhY2VOb2RlT3BlcmF0aW9uLCBTdGFuZGFyZFRyYW5zZm9ybSwgVHJhbnNmb3JtT3BlcmF0aW9uIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IG1ha2VUcmFuc2Zvcm0gfSBmcm9tICcuL21ha2VfdHJhbnNmb3JtJztcblxuXG5leHBvcnQgZnVuY3Rpb24gcmVwbGFjZUJvb3RzdHJhcChcbiAgc2hvdWxkVHJhbnNmb3JtOiAoZmlsZU5hbWU6IHN0cmluZykgPT4gYm9vbGVhbixcbiAgZ2V0RW50cnlNb2R1bGU6ICgpID0+IHsgcGF0aDogc3RyaW5nLCBjbGFzc05hbWU6IHN0cmluZyB9IHwgbnVsbCxcbiAgZ2V0VHlwZUNoZWNrZXI6ICgpID0+IHRzLlR5cGVDaGVja2VyLFxuKTogdHMuVHJhbnNmb3JtZXJGYWN0b3J5PHRzLlNvdXJjZUZpbGU+IHtcblxuICBjb25zdCBzdGFuZGFyZFRyYW5zZm9ybTogU3RhbmRhcmRUcmFuc2Zvcm0gPSBmdW5jdGlvbiAoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSkge1xuICAgIGNvbnN0IG9wczogVHJhbnNmb3JtT3BlcmF0aW9uW10gPSBbXTtcblxuICAgIGNvbnN0IGVudHJ5TW9kdWxlID0gZ2V0RW50cnlNb2R1bGUoKTtcblxuICAgIGlmICghc2hvdWxkVHJhbnNmb3JtKHNvdXJjZUZpbGUuZmlsZU5hbWUpIHx8ICFlbnRyeU1vZHVsZSkge1xuICAgICAgcmV0dXJuIG9wcztcbiAgICB9XG5cbiAgICAvLyBGaW5kIGFsbCBpZGVudGlmaWVycy5cbiAgICBjb25zdCBlbnRyeU1vZHVsZUlkZW50aWZpZXJzID0gY29sbGVjdERlZXBOb2Rlczx0cy5JZGVudGlmaWVyPihzb3VyY2VGaWxlLFxuICAgICAgdHMuU3ludGF4S2luZC5JZGVudGlmaWVyKVxuICAgICAgLmZpbHRlcihpZGVudGlmaWVyID0+IGlkZW50aWZpZXIudGV4dCA9PT0gZW50cnlNb2R1bGUuY2xhc3NOYW1lKTtcblxuICAgIGlmIChlbnRyeU1vZHVsZUlkZW50aWZpZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGNvbnN0IHJlbGF0aXZlRW50cnlNb2R1bGVQYXRoID0gcmVsYXRpdmUoZGlybmFtZShzb3VyY2VGaWxlLmZpbGVOYW1lKSwgZW50cnlNb2R1bGUucGF0aCk7XG4gICAgY29uc3Qgbm9ybWFsaXplZEVudHJ5TW9kdWxlUGF0aCA9IGAuLyR7cmVsYXRpdmVFbnRyeU1vZHVsZVBhdGh9YC5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG5cbiAgICAvLyBGaW5kIHRoZSBib290c3RyYXAgY2FsbHMuXG4gICAgZW50cnlNb2R1bGVJZGVudGlmaWVycy5mb3JFYWNoKGVudHJ5TW9kdWxlSWRlbnRpZmllciA9PiB7XG4gICAgICAvLyBGaWd1cmUgb3V0IGlmIGl0J3MgYSBgcGxhdGZvcm1Ccm93c2VyRHluYW1pYygpLmJvb3RzdHJhcE1vZHVsZShBcHBNb2R1bGUpYCBjYWxsLlxuICAgICAgaWYgKCEoXG4gICAgICAgIGVudHJ5TW9kdWxlSWRlbnRpZmllci5wYXJlbnRcbiAgICAgICAgJiYgZW50cnlNb2R1bGVJZGVudGlmaWVyLnBhcmVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLkNhbGxFeHByZXNzaW9uXG4gICAgICApKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgY2FsbEV4cHIgPSBlbnRyeU1vZHVsZUlkZW50aWZpZXIucGFyZW50IGFzIHRzLkNhbGxFeHByZXNzaW9uO1xuXG4gICAgICBpZiAoY2FsbEV4cHIuZXhwcmVzc2lvbi5raW5kICE9PSB0cy5TeW50YXhLaW5kLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHByb3BBY2Nlc3NFeHByID0gY2FsbEV4cHIuZXhwcmVzc2lvbiBhcyB0cy5Qcm9wZXJ0eUFjY2Vzc0V4cHJlc3Npb247XG5cbiAgICAgIGlmIChwcm9wQWNjZXNzRXhwci5uYW1lLnRleHQgIT09ICdib290c3RyYXBNb2R1bGUnXG4gICAgICAgIHx8IHByb3BBY2Nlc3NFeHByLmV4cHJlc3Npb24ua2luZCAhPT0gdHMuU3ludGF4S2luZC5DYWxsRXhwcmVzc2lvbikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGJvb3RzdHJhcE1vZHVsZUlkZW50aWZpZXIgPSBwcm9wQWNjZXNzRXhwci5uYW1lO1xuICAgICAgY29uc3QgaW5uZXJDYWxsRXhwciA9IHByb3BBY2Nlc3NFeHByLmV4cHJlc3Npb24gYXMgdHMuQ2FsbEV4cHJlc3Npb247XG5cbiAgICAgIGlmICghKFxuICAgICAgICBpbm5lckNhbGxFeHByLmV4cHJlc3Npb24ua2luZCA9PT0gdHMuU3ludGF4S2luZC5JZGVudGlmaWVyXG4gICAgICAgICYmIChpbm5lckNhbGxFeHByLmV4cHJlc3Npb24gYXMgdHMuSWRlbnRpZmllcikudGV4dCA9PT0gJ3BsYXRmb3JtQnJvd3NlckR5bmFtaWMnXG4gICAgICApKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGxhdGZvcm1Ccm93c2VyRHluYW1pY0lkZW50aWZpZXIgPSBpbm5lckNhbGxFeHByLmV4cHJlc3Npb24gYXMgdHMuSWRlbnRpZmllcjtcblxuICAgICAgY29uc3QgaWRQbGF0Zm9ybUJyb3dzZXIgPSB0cy5jcmVhdGVVbmlxdWVOYW1lKCdfX05nQ2xpX2Jvb3RzdHJhcF8nKTtcbiAgICAgIGNvbnN0IGlkTmdGYWN0b3J5ID0gdHMuY3JlYXRlVW5pcXVlTmFtZSgnX19OZ0NsaV9ib290c3RyYXBfJyk7XG5cbiAgICAgIC8vIEFkZCB0aGUgdHJhbnNmb3JtIG9wZXJhdGlvbnMuXG4gICAgICBjb25zdCBmYWN0b3J5Q2xhc3NOYW1lID0gZW50cnlNb2R1bGUuY2xhc3NOYW1lICsgJ05nRmFjdG9yeSc7XG4gICAgICBjb25zdCBmYWN0b3J5TW9kdWxlUGF0aCA9IG5vcm1hbGl6ZWRFbnRyeU1vZHVsZVBhdGggKyAnLm5nZmFjdG9yeSc7XG4gICAgICBvcHMucHVzaChcbiAgICAgICAgLy8gUmVwbGFjZSB0aGUgZW50cnkgbW9kdWxlIGltcG9ydC5cbiAgICAgICAgLi4uaW5zZXJ0U3RhckltcG9ydChzb3VyY2VGaWxlLCBpZE5nRmFjdG9yeSwgZmFjdG9yeU1vZHVsZVBhdGgpLFxuICAgICAgICBuZXcgUmVwbGFjZU5vZGVPcGVyYXRpb24oc291cmNlRmlsZSwgZW50cnlNb2R1bGVJZGVudGlmaWVyLFxuICAgICAgICAgIHRzLmNyZWF0ZVByb3BlcnR5QWNjZXNzKGlkTmdGYWN0b3J5LCB0cy5jcmVhdGVJZGVudGlmaWVyKGZhY3RvcnlDbGFzc05hbWUpKSksXG4gICAgICAgIC8vIFJlcGxhY2UgdGhlIHBsYXRmb3JtQnJvd3NlckR5bmFtaWMgaW1wb3J0LlxuICAgICAgICAuLi5pbnNlcnRTdGFySW1wb3J0KHNvdXJjZUZpbGUsIGlkUGxhdGZvcm1Ccm93c2VyLCAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3NlcicpLFxuICAgICAgICBuZXcgUmVwbGFjZU5vZGVPcGVyYXRpb24oc291cmNlRmlsZSwgcGxhdGZvcm1Ccm93c2VyRHluYW1pY0lkZW50aWZpZXIsXG4gICAgICAgICAgdHMuY3JlYXRlUHJvcGVydHlBY2Nlc3MoaWRQbGF0Zm9ybUJyb3dzZXIsICdwbGF0Zm9ybUJyb3dzZXInKSksXG4gICAgICAgIG5ldyBSZXBsYWNlTm9kZU9wZXJhdGlvbihzb3VyY2VGaWxlLCBib290c3RyYXBNb2R1bGVJZGVudGlmaWVyLFxuICAgICAgICAgIHRzLmNyZWF0ZUlkZW50aWZpZXIoJ2Jvb3RzdHJhcE1vZHVsZUZhY3RvcnknKSksXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9wcztcbiAgfTtcblxuICByZXR1cm4gbWFrZVRyYW5zZm9ybShzdGFuZGFyZFRyYW5zZm9ybSwgZ2V0VHlwZUNoZWNrZXIpO1xufVxuIl19