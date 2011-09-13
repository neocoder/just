#
# Just a build tool for Javascript
# Copyright 2011 Alex Ladyga (neocoder@gmail.com)
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

CWD := $(shell pwd)

.PHONY: all build install clean uninstall

all: build

build:
	@echo 'Just built.'

install:
		@ln -snf $(CWD)/just.js /usr/local/bin/just && \
		chmod 755 $(CWD)/just.js && \
		echo 'Just installed.'

clean:
	@true

uninstall:
	@rm -f /usr/local/bin/just && \
		echo 'Just uninstalled.'