// ignore_for_file: prefer_const_constructors, prefer_const_literals_to_create_immutables, must_be_immutable, unused_local_variable, unused_catch_stack

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class WMLTemplateLayoutWidgetRiverpodProviderValue {
  WMLTemplateLayoutWidgetRiverpodProviderValue copyWith() {
    return WMLTemplateLayoutWidgetRiverpodProviderValue();
  }
}

var WMLTemplateLayoutWidgetRiverpodProviderInstance = WMLTemplateLayoutWidgetRiverpodProviderValue();

class WMLTemplateLayoutWidgetRiverpodNotifier
    extends Notifier<WMLTemplateLayoutWidgetRiverpodProviderValue> {
  @override
  WMLTemplateLayoutWidgetRiverpodProviderValue build() {
    return WMLTemplateLayoutWidgetRiverpodProviderInstance;
  }
}

final WMLTemplateLayoutWidgetRiverpodProvider = NotifierProvider<
    WMLTemplateLayoutWidgetRiverpodNotifier, WMLTemplateLayoutWidgetRiverpodProviderValue>(() {
  return WMLTemplateLayoutWidgetRiverpodNotifier();
});
