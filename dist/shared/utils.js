/**
 * Utility functions for MCP servers
 */
import * as fs from 'fs/promises';
import * as path from 'path';
/**
 * Ensure directory exists, create if it doesn't
 */
export async function ensureDir(dirPath) {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    }
    catch (error) {
        if (error.code !== 'EEXIST') {
            throw error;
        }
    }
}
/**
 * Read JSON file safely
 */
export async function readJsonFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
}
/**
 * Write JSON file safely
 */
export async function writeJsonFile(filePath, data) {
    const dir = path.dirname(filePath);
    await ensureDir(dir);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}
/**
 * Append to JSON log file (array of objects)
 */
export async function appendToJsonLog(filePath, entry) {
    const dir = path.dirname(filePath);
    await ensureDir(dir);
    let entries = [];
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        entries = JSON.parse(content);
    }
    catch {
        // File doesn't exist or is invalid, start fresh
        entries = [];
    }
    entries.push(entry);
    await fs.writeFile(filePath, JSON.stringify(entries, null, 2));
}
/**
 * Generate unique ID
 */
export function generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return prefix ? `${prefix}-${timestamp}${random}` : `${timestamp}${random}`;
}
/**
 * Sleep for specified milliseconds
 */
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Retry a function with exponential backoff
 */
export async function retry(fn, maxRetries = 3, initialDelayMs = 1000) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                const delayMs = initialDelayMs * Math.pow(2, i);
                await sleep(delayMs);
            }
        }
    }
    throw lastError;
}
/**
 * Parse date string (YYYY-MM-DD)
 */
export function parseDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD`);
    }
    return date;
}
/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
/**
 * Validate date range
 */
export function validateDateRange(startDate, endDate) {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (start > end) {
        throw new Error('Start date must be before end date');
    }
    const maxDaysApart = 90; // Google API limit
    const daysApart = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysApart > maxDaysApart) {
        throw new Error(`Date range exceeds maximum of ${maxDaysApart} days`);
    }
}
/**
 * Validate URL format
 */
export function validateUrl(url) {
    try {
        new URL(url);
    }
    catch {
        throw new Error(`Invalid URL: ${url}`);
    }
}
/**
 * Validate GSC property format
 */
export function validateGSCProperty(property) {
    // Valid formats: sc-domain:example.com, sc-https://example.com, sc-http://example.com, sc-app:...
    const validPattern = /^sc-(domain|https?|app):/;
    if (!validPattern.test(property)) {
        throw new Error(`Invalid GSC property format: ${property}. Expected format like 'sc-domain:example.com' or 'sc-https://example.com'`);
    }
}
/**
 * Merge objects deeply
 */
export function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            const sourceValue = source[key];
            const targetValue = target[key];
            if (sourceValue !== null &&
                sourceValue !== undefined &&
                typeof sourceValue === 'object' &&
                !Array.isArray(sourceValue) &&
                typeof targetValue === 'object' &&
                !Array.isArray(targetValue)) {
                result[key] = deepMerge(targetValue, sourceValue);
            }
            else {
                result[key] = sourceValue;
            }
        }
    }
    return result;
}
/**
 * Flatten nested object to dot notation
 */
export function flattenObject(obj, prefix = '') {
    const result = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                Object.assign(result, flattenObject(value, newKey));
            }
            else {
                result[newKey] = value;
            }
        }
    }
    return result;
}
/**
 * Check if two objects are deeply equal
 */
export function deepEqual(obj1, obj2) {
    if (obj1 === obj2) {
        return true;
    }
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
        return false;
    }
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (const key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=utils.js.map