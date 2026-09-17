import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
 
// Can be imported from a shared config
const locales = ['fr', 'en'];
 
export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
  console.log('getRequestConfig called with locale:', locale);
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as any)) {
    console.log('Locale not found in locales array, falling back to fr');
    locale = 'fr';
  }
 
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
