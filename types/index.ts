import { StartSpeechSynthesisTaskCommandInput } from '@aws-sdk/client-polly'

export type SpeechBase = {
  OutputS3BucketName: string
  Engine: string
  LanguageCode: string
  TextType: string
  VoiceId: string
} & Partial<StartSpeechSynthesisTaskCommandInput>
