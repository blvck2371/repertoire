{{/*
Expand the name of the chart.
*/}}
{{- define "repertoire.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "repertoire.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "repertoire.labels" -}}
helm.sh/chart: {{ include "repertoire.name" . }}
app.kubernetes.io/name: {{ include "repertoire.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Backend selector labels
*/}}
{{- define "repertoire.backend.labels" -}}
{{ include "repertoire.labels" . }}
app.kubernetes.io/component: backend
{{- end }}

{{/*
Frontend selector labels
*/}}
{{- define "repertoire.frontend.labels" -}}
{{ include "repertoire.labels" . }}
app.kubernetes.io/component: frontend
{{- end }}

{{/*
MongoDB selector labels
*/}}
{{- define "repertoire.mongodb.labels" -}}
{{ include "repertoire.labels" . }}
app.kubernetes.io/component: mongodb
{{- end }}

{{/*
Create image name with optional registry (backend, frontend)
*/}}
{{- define "repertoire.image" -}}
{{- if .Values.imageRegistry -}}
{{ .Values.imageRegistry }}/{{ .repository }}:{{ .tag | default .Chart.AppVersion }}
{{- else -}}
{{ .repository }}:{{ .tag | default .Chart.AppVersion }}
{{- end }}
{{- end }}

{{/*
MongoDB image - Harbor si mongodbImageRegistry défini, sinon Docker Hub
*/}}
{{- define "repertoire.mongodb.image" -}}
{{- if .Values.mongodbImageRegistry -}}
{{ .Values.mongodbImageRegistry }}/mongo:{{ .Values.mongodb.image.tag | default "7" }}
{{- else -}}
{{ .Values.mongodb.image.repository }}:{{ .Values.mongodb.image.tag | default "7" }}
{{- end }}
{{- end }}
