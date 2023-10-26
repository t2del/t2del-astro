declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	export { z } from 'astro/zod';

	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	// This needs to be in sync with ImageMetadata
	export type ImageFunction = () => import('astro/zod').ZodObject<{
		src: import('astro/zod').ZodString;
		width: import('astro/zod').ZodNumber;
		height: import('astro/zod').ZodNumber;
		format: import('astro/zod').ZodUnion<
			[
				import('astro/zod').ZodLiteral<'png'>,
				import('astro/zod').ZodLiteral<'jpg'>,
				import('astro/zod').ZodLiteral<'jpeg'>,
				import('astro/zod').ZodLiteral<'tiff'>,
				import('astro/zod').ZodLiteral<'webp'>,
				import('astro/zod').ZodLiteral<'gif'>,
				import('astro/zod').ZodLiteral<'svg'>,
				import('astro/zod').ZodLiteral<'avif'>,
			]
		>;
	}>;

	type BaseSchemaWithoutEffects =
		| import('astro/zod').AnyZodObject
		| import('astro/zod').ZodUnion<[BaseSchemaWithoutEffects, ...BaseSchemaWithoutEffects[]]>
		| import('astro/zod').ZodDiscriminatedUnion<string, import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodIntersection<BaseSchemaWithoutEffects, BaseSchemaWithoutEffects>;

	type BaseSchema =
		| BaseSchemaWithoutEffects
		| import('astro/zod').ZodEffects<BaseSchemaWithoutEffects>;

	export type SchemaContext = { image: ImageFunction };

	type DataCollectionConfig<S extends BaseSchema> = {
		type: 'data';
		schema?: S | ((context: SchemaContext) => S);
	};

	type ContentCollectionConfig<S extends BaseSchema> = {
		type?: 'content';
		schema?: S | ((context: SchemaContext) => S);
	};

	type CollectionConfig<S> = ContentCollectionConfig<S> | DataCollectionConfig<S>;

	export function defineCollection<S extends BaseSchema>(
		input: CollectionConfig<S>
	): CollectionConfig<S>;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
			  }
			: {
					collection: C;
					id: keyof DataEntryMap[C];
			  }
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"blog": {
"markdown-style-guide.md": {
	id: "markdown-style-guide.md";
  slug: "markdown-style-guide";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"post-1 copy 10.md": {
	id: "post-1 copy 10.md";
  slug: "post-1-copy-10";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"post-1 copy 11.md": {
	id: "post-1 copy 11.md";
  slug: "post-1-copy-11";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"post-1 copy 12.md": {
	id: "post-1 copy 12.md";
  slug: "post-1-copy-12";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"post-1 copy 13.md": {
	id: "post-1 copy 13.md";
  slug: "post-1-copy-13";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"post-1 copy 14.md": {
	id: "post-1 copy 14.md";
  slug: "post-1-copy-14";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"post-1 copy 15.md": {
	id: "post-1 copy 15.md";
  slug: "post-1-copy-15";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"post-1 copy 16.md": {
	id: "post-1 copy 16.md";
  slug: "post-1-copy-16";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"post-1 copy 17.md": {
	id: "post-1 copy 17.md";
  slug: "post-1-copy-17";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"post-1 copy 18.md": {
	id: "post-1 copy 18.md";
  slug: "post-1-copy-18";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"post-1 copy 2.md": {
	id: "post-1 copy 2.md";
  slug: "post-1-copy-2";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"post-1 copy 3.md": {
	id: "post-1 copy 3.md";
  slug: "post-1-copy-3";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"post-1 copy 4.md": {
	id: "post-1 copy 4.md";
  slug: "post-1-copy-4";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"post-1 copy 5.md": {
	id: "post-1 copy 5.md";
  slug: "post-1-copy-5";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"post-1 copy 6.md": {
	id: "post-1 copy 6.md";
  slug: "post-1-copy-6";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"post-1 copy 7.md": {
	id: "post-1 copy 7.md";
  slug: "post-1-copy-7";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"post-1 copy 8.md": {
	id: "post-1 copy 8.md";
  slug: "post-1-copy-8";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"post-1 copy 9.md": {
	id: "post-1 copy 9.md";
  slug: "post-1-copy-9";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"post-1 copy.md": {
	id: "post-1 copy.md";
  slug: "post-1-copy";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"post-1.md": {
	id: "post-1.md";
  slug: "post-1";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
};
"project": {
"Agogo.md": {
	id: "Agogo.md";
  slug: "agogo";
  body: string;
  collection: "project";
  data: InferEntrySchema<"project">
} & { render(): Render[".md"] };
"Clovers SG.md": {
	id: "Clovers SG.md";
  slug: "clovers-sg";
  body: string;
  collection: "project";
  data: InferEntrySchema<"project">
} & { render(): Render[".md"] };
"DomesticOne.md": {
	id: "DomesticOne.md";
  slug: "domesticone";
  body: string;
  collection: "project";
  data: InferEntrySchema<"project">
} & { render(): Render[".md"] };
"Griddle Grinder.md": {
	id: "Griddle Grinder.md";
  slug: "griddle-grinder";
  body: string;
  collection: "project";
  data: InferEntrySchema<"project">
} & { render(): Render[".md"] };
"MF Media.md": {
	id: "MF Media.md";
  slug: "mf-media";
  body: string;
  collection: "project";
  data: InferEntrySchema<"project">
} & { render(): Render[".md"] };
"Novel Communications.md": {
	id: "Novel Communications.md";
  slug: "novel-communications";
  body: string;
  collection: "project";
  data: InferEntrySchema<"project">
} & { render(): Render[".md"] };
"Patmos Bible.md": {
	id: "Patmos Bible.md";
  slug: "patmos-bible";
  body: string;
  collection: "project";
  data: InferEntrySchema<"project">
} & { render(): Render[".md"] };
"Shang Antique.md": {
	id: "Shang Antique.md";
  slug: "shang-antique";
  body: string;
  collection: "project";
  data: InferEntrySchema<"project">
} & { render(): Render[".md"] };
"Sis Premium Meats.md": {
	id: "Sis Premium Meats.md";
  slug: "sis-premium-meats";
  body: string;
  collection: "project";
  data: InferEntrySchema<"project">
} & { render(): Render[".md"] };
"Sona.md": {
	id: "Sona.md";
  slug: "sona";
  body: string;
  collection: "project";
  data: InferEntrySchema<"project">
} & { render(): Render[".md"] };
"Stellar Technology.md": {
	id: "Stellar Technology.md";
  slug: "stellar-technology";
  body: string;
  collection: "project";
  data: InferEntrySchema<"project">
} & { render(): Render[".md"] };
"Unitronics Component.md": {
	id: "Unitronics Component.md";
  slug: "unitronics-component";
  body: string;
  collection: "project";
  data: InferEntrySchema<"project">
} & { render(): Render[".md"] };
"asia-marketplace.md": {
	id: "asia-marketplace.md";
  slug: "asia-marketplace";
  body: string;
  collection: "project";
  data: InferEntrySchema<"project">
} & { render(): Render[".md"] };
"begen.md": {
	id: "begen.md";
  slug: "begen";
  body: string;
  collection: "project";
  data: InferEntrySchema<"project">
} & { render(): Render[".md"] };
"dmontessori.md": {
	id: "dmontessori.md";
  slug: "dmontessori";
  body: string;
  collection: "project";
  data: InferEntrySchema<"project">
} & { render(): Render[".md"] };
"fullertonhealthgroup.md": {
	id: "fullertonhealthgroup.md";
  slug: "fullertonhealthgroup";
  body: string;
  collection: "project";
  data: InferEntrySchema<"project">
} & { render(): Render[".md"] };
"fullertonhealthsingapore.md": {
	id: "fullertonhealthsingapore.md";
  slug: "fullertonhealthsingapore";
  body: string;
  collection: "project";
  data: InferEntrySchema<"project">
} & { render(): Render[".md"] };
"jinders.md": {
	id: "jinders.md";
  slug: "jinders";
  body: string;
  collection: "project";
  data: InferEntrySchema<"project">
} & { render(): Render[".md"] };
"marvid-international.md": {
	id: "marvid-international.md";
  slug: "marvid-international";
  body: string;
  collection: "project";
  data: InferEntrySchema<"project">
} & { render(): Render[".md"] };
"new-peng-hiang.md": {
	id: "new-peng-hiang.md";
  slug: "new-peng-hiang";
  body: string;
  collection: "project";
  data: InferEntrySchema<"project">
} & { render(): Render[".md"] };
"spring-brainy-kidz.md": {
	id: "spring-brainy-kidz.md";
  slug: "spring-brainy-kidz";
  body: string;
  collection: "project";
  data: InferEntrySchema<"project">
} & { render(): Render[".md"] };
"unique-fine-pearls.md": {
	id: "unique-fine-pearls.md";
  slug: "unique-fine-pearls";
  body: string;
  collection: "project";
  data: InferEntrySchema<"project">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	type ContentConfig = typeof import("../src/content/config");
}
