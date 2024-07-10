"""_summary_
The script wont fix a file that has the correct key paths but language issues if not start from scratch

There are very high measures in place to ensure that the dest_json is translated as much and as accurately as possible

The dest_json has the same key paths as the source_json but not in the same order hopefully you do not have to
worry about the order of the keys
"""

import random
import sys
from threading import Thread

from list_to_dict_utils import  generate_key_map, get_all_keys,  longest_list_length, replace_lists_with_mapped_objects, revert_mapped_objects_to_lists

def local_deps(platform=sys.platform):
  if platform == 'win32':
    sys.path.append(sys.path[0] + '\\site-packages\\windows')
  elif platform == 'linux':
    sys.path.append(sys.path[0] + '/site-packages/linux')
  elif platform == 'darwin':
    sys.path.append(sys.path[0] + '/site-packages/linux')

local_deps()
from openai import OpenAI
import argparse
from enum import Enum
from json import dump, dumps,load, loads
import os
import re
import pprint
from tenacity import wait_random_exponential,stop_after_attempt,retry
from tqdm import tqdm

pp = pprint.PrettyPrinter(indent=2, compact=False, width=1)

# Guides chat-gpt
def translate_list(source_array, source_lang, dest_lang,translate = lambda x,y,z:"translated_value"):
  # This function is a placeholder for the actual translation function
  return [translate(source_lang,dest_lang,item) for item in source_array]

def was_translation_successful(failure,dest_array):
  failure = any(is_from_source_lang(item) for item in dest_array)
  return failure




def remove_random_item(json_obj, key_prob=0.7, list_prob=0.7):
  if isinstance(json_obj, dict):
    keys = list(json_obj.keys())
    if keys and random.random() < key_prob:
      random_key = random.choice(keys)
      json_obj.pop(random_key)
    for key in list(json_obj.keys()):  # Use list to avoid RuntimeError due to changing dict size during iteration
      remove_random_item(json_obj[key], key_prob, list_prob)
  elif isinstance(json_obj, list):
    if json_obj and random.random() < list_prob:
      random_index = random.choice(range(len(json_obj)))
      json_obj.pop(random_index)
    for item in json_obj:
      remove_random_item(item, key_prob, list_prob)
  return json_obj

class OpenAIModelChatCompletionEnum(Enum):
  GPT_35_TURBO_16K ={
    "name":"gpt-3.5-turbo-16k",
    "max_tokens":int(16384  ),
    "sleep_time":60
  }
  GPT_35_TURBO_0301 ={
    "name":"gpt-3.5-turbo-0301",
    "max_tokens":int(4096 ),
    "sleep_time":60
  }
  GPT_35_TURBO = {
    "name":"gpt-3.5-turbo",
    "max_tokens":int(4096 ),
    "sleep_time":60
  }
  GPT_4_0125_PREVIEW ={
    "name":"gpt-4-0125-preview",
    "max_tokens":int(4096),
    "sleep_time":60
  }
  GPT_3_5_TURBO_0125 ={
    "name":"gpt-3.5-turbo-0125",
    "max_tokens":int(4096),
    "sleep_time":60
  }

class OpenAIManager():
  model = OpenAIModelChatCompletionEnum.GPT_3_5_TURBO_0125
  translation_prompt = """
  Given the list of strings below, each item is in the "{}" language. Your task is to translate each item into the "{}" language. It is important that the translation is accurate and reflects the correct meaning in the destination language. Please ensure that the output is solely a list of translated strings, without any additional comments or explanations. The focus should be on the accuracy and relevance of the translations.

  Original list:
  `{}`

  Translate this list from "{}" to "{}" and return the translated list. Make sure to carefully review each translation to ensure it is correct and appropriate for the context.
  """
  translation_prompt_tools = [
    {
        "type": "function",
        "function": {
            "name": "translate_list",
            "description": "Translates each item in a list from one language to another",
            "parameters": {
                "type":"object",
                "properties": {
                  "dest_array":{
                    "type": "array",
                    "items":{"type": "string", "description": "The respective translated list of values"}
                  },
                  # "source_array":{
                  #   "type": "array",
                  #   "items":{"type": "string", "description": "The soruce list of values to translate"}
                  # },
                  # "source_lang": {"type": "string", "description": "The language of the source text"},
                  # "dest_lang": {"type": "string", "description": "The language to translate the source text to"}
                },
            },
        },
    }
  ]
  was_translation_successful_prompt = """
  For every value in the given list {} are any of the values in the {} language return either return   False for no or True for yes
  """
  was_translation_successful_prompt_tools = [
  {
      "type": "function",
      "function": {
          "name": "was_translation_successful",
          "description": "Iterates through a list of translated values and checks if any of the values are in the source language returns False for no values or True if there was at least 1",
          "parameters": {
              "type":"object",
              "properties": {
                "failure":{
                  "type": "boolean",
                  "description":" False if there were none True if there was at least 1 value in the source language,"
                },
                # "source_array":{
                #   "type": "array",
                #   "items":{"type": "string", "description": "The soruce list of values to translate"}
                # },
                # "source_lang": {"type": "string", "description": "The language of the source text"},
                # "dest_lang": {"type": "string", "description": "The language to translate the source text to"}
              },
          },
      },
    }
  ]

  language_codes = {
    'zh': 'Mandarin Chinese',
    'ja': 'Japanese',
    'pt': 'Portuguese',
    'es': 'Spanish',
    'en': 'English',
    'hi': 'Hindi',
    'uk': 'Ukrainian',
    'ar': 'Arabic',
    'bn': 'Bengali',
    'ms': 'Malay',
    'fr': 'French',
    'de': 'German',
    'sw': 'Swahili',
    'am': 'Amharic'
  }

  def __init__(self,api_key,retry_ask_chatgpt=3):
      self.init = True
      self.client = OpenAI(api_key=api_key)
      self.retry_ask_chatgpt = retry_ask_chatgpt

  def _process_json_for_null_values(self, source, dest, current_path):
    if isinstance(dest, dict):
      for key, value in dest.items():
        new_path = current_path + [key]
        if value is None:
          self._add_value_from_source(source, key, new_path)
        elif isinstance(value, (dict, list)):
          source_item = source.get(key, type(value)())
          self._process_json_for_null_values(source_item, value, new_path)
    elif isinstance(dest, list):
      self._process_list_for_null_values(source, dest, current_path)

  def _process_list_for_null_values(self, source, dest, current_path):
    for i, item in enumerate(dest):
      new_path = current_path + [str(i)]
      if item is None and i < len(source):
        self._add_value_from_source(source, i, new_path)
      elif isinstance(item, (dict, list)):
        source_item = source[i] if i < len(source) else type(item)()
        self._process_json_for_null_values(source_item, item, new_path)

  def _add_value_from_source(self, source, key, path):
    if isinstance(key, int):  # Adjusted for list source handling
      value = source[key] if key < len(source) else None
    else:  # Dict source handling
      value = source.get(key)
    if value is not None:
      if isinstance(value, str):
        self.all_missing_values.append(value)
        self.all_missing_value_paths.append(".".join(map(str, path)))
      elif isinstance(value, dict):
        for sub_key in value:
          new_path = path + [sub_key]
          self._add_value_from_source(value, sub_key, new_path)
      elif isinstance(value, list):
        for i, item in enumerate(value):
          new_path = path + [str(i)]
          self._add_value_from_source(value, i, new_path)

  def _map_translated_values_back(self, dest_json):
    for group in self.chunked_missing_groups:
      for result, path in zip(group["result"], group["value_paths"]):
        self._set_value_by_path(dest_json, path.split('.'), result)

  def _set_value_by_path(self, obj, path, value):
      for i, key in enumerate(path):
          if i + 1 < len(path):  # Not at the last key yet
              if key.isdigit():
                  key = int(key)  # Convert to integer for lists
                  while key >= len(obj):
                      obj.append(None)  # Extend the list with None values if key is out of current range
                  if obj[key] is None:
                      # Determine the type of the next key to decide whether to insert a list or a dictionary
                      next_key = path[i + 1]
                      obj[key] = [] if next_key.isdigit() else {}
              else:
                  if key not in obj:
                      # Insert a list or a dictionary based on the next key
                      next_key = path[i + 1]
                      obj[key] = [] if next_key.isdigit() else {}
              obj = obj[key]
          else:  # Last key, set the value
              if key.isdigit():
                  key = int(key)
                  while key >= len(obj):
                      obj.append(None)
                  obj[key] = value
              else:
                  if obj == None:
                    print(obj)
                  obj[key] = value



  @retry(wait=wait_random_exponential(multiplier=1, max=40), stop=stop_after_attempt(3))
  def _ask_chatgpt(self,content,tools):
    try:

      messages = [{"role": "user", "content": content}]

      response = self.client.chat.completions.create(
        model=self.model.value['name'],
        messages=messages,
        tools=tools,
        tool_choice="auto",  # auto is default, but we'll be explicit
      )

      # print(chunk)
      fn_args = loads(response.choices[0].message.tool_calls[0].function.arguments)
      return fn_args
    except  Exception as e:
      print(e)
      raise e



  def mirror(self, source, dest):
    if not isinstance(dest, type(source)):
      return {k: None for k in source} if isinstance(source, dict) else [None] * len(source)
    if isinstance(source, dict):
      keys_to_delete = dest.keys() - source.keys()
      for key in keys_to_delete:
        del dest[key]
      for key, value in source.items():
        if key not in dest or not isinstance(dest[key], type(value)):
          dest[key] = {} if isinstance(value, dict) else [None] * len(value) if isinstance(value, list) else None
        self.mirror(value, dest[key])
    elif isinstance(source, list):
      for i in range(len(source)):
        if i >= len(dest) or not isinstance(dest[i], type(source[i])):
          dest.append(None)
        self.mirror(source[i], dest[i])
      del dest[len(source):]
    return dest





  def gather_values_for_translation(self, source_json, dest_json):
    self.all_missing_values = []  # Reset for each translation task
    self.all_missing_value_paths = []  # Reset for each translation task
    self._process_json_for_null_values(source_json, dest_json, [])

  def chunk_values_based_on_tokens(self):
      max_length_per_chunk = (self.model.value['max_tokens'] // 2)  - (len(self.translation_prompt) + 20) # 2x because we're using json.dumps to get the length of the string
      chunked_missing_values = []
      chunked_missing_value_paths = []
      current_chunk = []
      current_chunk_paths = []
      current_length = 0

      for value, path in zip(self.all_missing_values, self.all_missing_value_paths):
          value_str = dumps(value)
          value_length = len(value_str)

          if current_length + value_length > max_length_per_chunk:
              chunked_missing_values.append(current_chunk)
              chunked_missing_value_paths.append(current_chunk_paths)
              current_chunk = [value]
              current_chunk_paths = [path]
              current_length = value_length
          else:
              current_chunk.append(value)
              current_chunk_paths.append(path)
              current_length += value_length

      if current_chunk:
          chunked_missing_values.append(current_chunk)
          chunked_missing_value_paths.append(current_chunk_paths)


      self.chunked_missing_groups = list(zip(chunked_missing_values, chunked_missing_value_paths))
      self.chunked_missing_groups = [ {"chunk":x,"value_paths":y} for x,y in self.chunked_missing_groups if x and y]



  def translate_and_map(self, dest_json, source_lang, dest_lang,key_map):

    @retry(wait=wait_random_exponential(multiplier=1, max=40), stop=stop_after_attempt(10))
    def translate(group):
      translation_content =self.translation_prompt.format(source_lang,dest_lang,group["chunk"],source_lang,dest_lang)
      group["result"] = self._ask_chatgpt(translation_content,self.translation_prompt_tools).get("dest_array")
      was_translation_successful_content = self.was_translation_successful_prompt.format(group["result"],source_lang)
      failure = self._ask_chatgpt(was_translation_successful_content,self.was_translation_successful_prompt_tools)
      failure = failure.get("failure")
      if not group["result"] or len(group["result"]) != len(group["chunk"]) or any(item is None for item in group["result"]) or failure:
        pass
      # print(group["value_paths"])
      # print(len(group["result"]))
      # print(len(group["value_paths"]))
      if failure:

        raise ValueError("One or more translated values are still in the source language {}".format(group["result"]))
      if not group["result"]:
        raise ValueError("Translation failed")
      if len(group["result"]) != len(group["value_paths"]):
        raise ValueError("The number of translated values does not match the number of source values")
      if any(item is None for item in group["result"]):
        raise ValueError("One or more translated values are null")



    threads = []
    for group in self.chunked_missing_groups:
      # threads.append(translate(group))
      thread = Thread(target=translate, args=(group,))
      threads.append(thread)
      thread.start()

    for thread in tqdm(threads, desc="Translating {}".format(dest_lang)):
      thread.join()


    self._map_translated_values_back(dest_json)

  def safe_write_to_dest_file(self, dest_json, dest_file):
      original_content = None
      print("writing to dest file")
      # Check if the dest_file already exists and read its original content
      if os.path.exists(dest_file):
          with open(dest_file, 'r', encoding='utf-8') as file:
              original_content = file.read()

      try:
          # Attempt to write the new content to the dest_file
          with open(dest_file, 'w', encoding='utf-8') as file:
              dump(dest_json, file, indent=2, ensure_ascii=False)
      except Exception as e:
          # If an error occurs, log the error and write back the original content if it exists
          print(f"Error writing to {dest_file}: {e}")
          if original_content is not None:
              with open(dest_file, 'w', encoding='utf-8') as file:
                  file.write(original_content)
          else:
              # If there was no original content (new file), ensure no corrupted file is left
              try:
                  os.remove(dest_file)
              except OSError as os_error:
                  print(f"Error removing corrupted file {dest_file}: {os_error}")
          raise


  def update_dest_language(self, source_json, dest_json, source_lang, dest_lang, abs_path_dest_file):


    existing_keys = get_all_keys(source_json)
    existing_keys.update( get_all_keys(dest_json))
    longest_list = max(
      longest_list_length(source_json),
      longest_list_length(dest_json)
    )  # Ensure we do not use any existing keys
    key_map = generate_key_map(longest_list,existing_keys)

    source_json = replace_lists_with_mapped_objects(source_json, key_map)
    dest_json = replace_lists_with_mapped_objects(dest_json, key_map)

    dest_json =self.mirror(source_json, dest_json)

    self.gather_values_for_translation(source_json, dest_json)

    self.chunk_values_based_on_tokens()

    self.translate_and_map(dest_json, source_lang, dest_lang,key_map)

    dest_json = revert_mapped_objects_to_lists(dest_json, key_map)
    self.safe_write_to_dest_file(dest_json, abs_path_dest_file)

  def update_translations(self, dev_obj):
    lang_codes = dev_obj.get("lang_codes")
    source_file = dev_obj.get("source_file")
    dest_file = dev_obj.get("dest_file")
    abs_path_source_file = dev_obj.get("abs_path_source_file")
    source_json = {}
    source_lang = self.language_codes.get(source_file.split(".")[0])
    with open(abs_path_source_file, encoding="utf-8") as f:
      source_json = load(f)
    print(dev_obj["remove_json_keys"])


    threads = []
    with tqdm(total=len(lang_codes), desc="Updating Translations") as pbar:
      for x in lang_codes:
        x = re.sub(r"\s", "", x)
        dest_json = {}
        dest_lang = self.language_codes.get(x)

        abs_path_dest_file = os.path.join(os.getcwd(), args.location, dest_file.replace("{}", x))
        if not os.path.exists(abs_path_dest_file):
          with open(abs_path_dest_file, 'w') as e:
            e.write("{}")
        with open(abs_path_dest_file, encoding="utf-8") as g:
          dest_json = load(g)

        if dev_obj["remove_json_keys"] == "TRUE":

          dest_json = remove_random_item(dest_json)
          with open(abs_path_dest_file, encoding="utf-8",mode="w") as f:
            dump(dest_json,f)

        # TODO
        # threads.append()
        self.update_dest_language(source_json, dest_json, source_lang, dest_lang, abs_path_dest_file)

        #
        # thread = Thread(target=self.update_dest_language, args=(source_json, dest_json, source_lang, dest_lang, abs_path_dest_file))
        # threads.append(thread)
        # thread.start()


        pbar.update(1)

    for thread in threads:
      thread.join()

if __name__ == "__main__":
  parser = argparse.ArgumentParser(
    prog='Translation Script',
    description='translates angular 18n script',
    epilog='Text at the bottom of help'
  )
  parser.add_argument('-l','--location')
  parser.add_argument('-s','--source-file')
  parser.add_argument('-d','--dest-file',default="{}.json")
  parser.add_argument('-c','--lang-codes')
  parser.add_argument('-r','--remove-json-keys')
  args = parser.parse_args()
  abs_path_source_file = os.path.join(os.getcwd(),args.location,args.source_file)

  lang_codes = args.lang_codes.split(",")
  params= {
    "lang_codes":lang_codes,
    "source_file":args.source_file,
    "dest_file":args.dest_file,
    "remove_json_keys":args.remove_json_keys,
    "abs_path_source_file":abs_path_source_file
  }
  mngr = OpenAIManager(os.environ.get("OPENAI_API_KEY_0"))
  mngr.update_translations(params)
