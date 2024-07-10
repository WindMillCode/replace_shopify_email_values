from random import choice, choices, randint, shuffle
from string import ascii_lowercase



def get_all_keys(nested_obj):
  keys = set()

  def recurse(obj):
    if isinstance(obj, dict):
      for key, value in obj.items():
        keys.add(key)
        recurse(value)
    elif isinstance(obj, list):
      for item in obj:
        recurse(item)

  recurse(nested_obj)
  return keys



def longest_list_length(nested_obj):
  def recurse(obj):
    if isinstance(obj, list):
      longest = len(obj)
      for item in obj:
        longest = max(longest, recurse(item))
      return longest
    elif isinstance(obj, dict):
      longest = 0
      for key, value in obj.items():
        longest = max(longest, recurse(value))
      return longest
    return 0

  return recurse(nested_obj)
def generate_random_word(existing_words, length=8):
  while True:
    word = ''.join(choices(ascii_lowercase, k=length))
    if word not in existing_words:
      return word

def generate_key_map(longest_list_length,existing_words):
  def generate_random_word():
    length = randint(5, 10)  # random word length between 5 and 10
    return ''.join(choice(ascii_lowercase) for _ in range(length))

  keys = set()
  while len(keys) < longest_list_length:
    while True:
      random_word = generate_random_word()
      if random_word not in existing_words:
        break
    keys.add(random_word)

  values = list(range(longest_list_length))
  shuffle(values)
  key_map = {value:key  for key, value in zip(keys, values)}

  return key_map

def replace_lists_with_mapped_objects(obj, key_map):
  if isinstance(obj, list):
    # Recursively apply to each item in the list
    return {key_map[i]: replace_lists_with_mapped_objects(item, key_map) for i, item in enumerate(obj)}
  elif isinstance(obj, dict):
    # Recursively apply to each value in the dictionary
    return {key: replace_lists_with_mapped_objects(value, key_map) for key, value in obj.items()}
  else:
    # Base case: return the item itself if it's neither a list nor a dictionary
    return obj


def revert_mapped_objects_to_lists(obj, key_map):
  reverse_key_map = {v: k for k, v in key_map.items()}

  if isinstance(obj, dict):
    if all(key in reverse_key_map for key in obj.keys()):
      sorted_items = sorted(obj.items(), key=lambda item: reverse_key_map[item[0]])
      return [revert_mapped_objects_to_lists(value, key_map) for _, value in sorted_items]
    else:
      return {key: revert_mapped_objects_to_lists(value, key_map) for key, value in obj.items()}
  elif isinstance(obj, list):
    return [revert_mapped_objects_to_lists(item, key_map) for item in obj]
  else:
    return obj
