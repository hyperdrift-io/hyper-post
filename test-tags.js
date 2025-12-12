// Simple test for tag extraction functionality
function extractHashtagsFromContent(content) {
  // Match hashtags that are standalone or at the end of lines
  // This regex looks for # followed by word characters, allowing for hyphens, underscores, and spaces in multi-word hashtags
  const hashtagRegex = /#([a-zA-Z][a-zA-Z0-9\s_-]*?)(?=\s|$|[^a-zA-Z0-9\s_-])/g;

  const hashtags = [];
  let match;

  while ((match = hashtagRegex.exec(content)) !== null) {
    const tag = match[1].trim().toLowerCase().replace(/[\s_-]+/g, '-'); // Normalize spaces and underscores to hyphens
    if (tag.length > 0 && tag.length <= 25) { // Medium tag limit
      hashtags.push(tag);
    }
  }

  return [...new Set(hashtags)]; // Remove duplicates
}

function processTagsForMedium(explicitTags = [], content) {
  // Extract hashtags from content
  const extractedTags = extractHashtagsFromContent(content);

  // Combine explicit tags with extracted tags
  const allTags = [...explicitTags, ...extractedTags];

  // Normalize tags: lowercase, trim, remove duplicates
  const normalizedTags = allTags
    .map(tag => tag.toLowerCase().trim())
    .filter(tag => tag.length > 0 && tag.length <= 25)
    .filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates

  // Medium allows maximum 5 tags
  const finalTags = normalizedTags.slice(0, 5);

  if (normalizedTags.length > 5) {
    console.warn(`⚠️ Medium allows maximum 5 tags. Using first 5: ${finalTags.join(', ')}`);
  }

  return finalTags;
}

// Test the functionality
const content = '# This is a test post about #javascript and #web-development. Also covers #react and #typescript.';
const explicitTags = ['programming', 'coding'];

console.log('Content:', content);
console.log('Explicit tags:', explicitTags);
console.log('Extracted hashtags:', extractHashtagsFromContent(content));
console.log('Processed tags:', processTagsForMedium(explicitTags, content));

// Test edge cases
console.log('\n--- Edge Cases ---');
console.log('No hashtags:', processTagsForMedium(['tech'], 'Regular content without hashtags'));
console.log('Only hashtags:', processTagsForMedium([], '#javascript #react #vue #angular #svelte #nextjs'));
console.log('Mixed case:', processTagsForMedium(['Tech'], '#JavaScript #react'));
console.log('Long tags:', processTagsForMedium([], '#this-is-a-very-long-tag-that-exceeds-the-twenty-five-character-limit'));
