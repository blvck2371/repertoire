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
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "repertoire.labels" -}}
helm.sh/chart: {{ include "repertoire.name" . }}
app.kubernetes.io/name: {{ include "repertoire.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Backend image
*/}}
{{- define "repertoire.backend.image" -}}
{{- if .Values.registry }}
{{- printf "%s/%s:%s" .Values.registry .Values.backend.image.repository .Values.imageTag }}
{{- else }}
{{- printf "%s:%s" .Values.backend.image.repository .Values.imageTag }}
{{- end }}
{{- end }}

{{/*
Frontend image
*/}}
{{- define "repertoire.frontend.image" -}}
{{- if .Values.registry }}
{{- printf "%s/%s:%s" .Values.registry .Values.frontend.image.repository .Values.imageTag }}
{{- else }}
{{- printf "%s:%s" .Values.frontend.image.repository .Values.imageTag }}
{{- end }}
{{- end }}
