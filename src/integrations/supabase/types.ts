export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      avatars: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_default: boolean
          name: string
          prompt: string
          reference_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_default?: boolean
          name: string
          prompt: string
          reference_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_default?: boolean
          name?: string
          prompt?: string
          reference_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          category: string
          content: string
          created_at: string
          excerpt: string
          featured: boolean | null
          featured_image: string | null
          id: string
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          og_image: string | null
          published_at: string | null
          reading_time: number | null
          scheduled_at: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string
          featured?: boolean | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string | null
          reading_time?: number | null
          scheduled_at?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string
          featured?: boolean | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string | null
          reading_time?: number | null
          scheduled_at?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      content_generations: {
        Row: {
          created_at: string
          generated_content: string
          id: string
          keywords: string[] | null
          language: string | null
          prompt: string
          template_type: string
          user_id: string
          word_count: number
        }
        Insert: {
          created_at?: string
          generated_content: string
          id?: string
          keywords?: string[] | null
          language?: string | null
          prompt: string
          template_type: string
          user_id: string
          word_count: number
        }
        Update: {
          created_at?: string
          generated_content?: string
          id?: string
          keywords?: string[] | null
          language?: string | null
          prompt?: string
          template_type?: string
          user_id?: string
          word_count?: number
        }
        Relationships: []
      }
      daily_todos: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          date: string
          id: string
          position: number
          title: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          date?: string
          id?: string
          position?: number
          title: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          date?: string
          id?: string
          position?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      discount_code_usage: {
        Row: {
          discount_code_id: string
          id: string
          used_at: string
          user_id: string
        }
        Insert: {
          discount_code_id: string
          id?: string
          used_at?: string
          user_id: string
        }
        Update: {
          discount_code_id?: string
          id?: string
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discount_code_usage_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string
          discount_percent: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          updated_at: string
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_percent: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          updated_at?: string
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_percent?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          updated_at?: string
          used_count?: number | null
        }
        Relationships: []
      }
      dismissed_notifications: {
        Row: {
          dismissed_at: string
          id: string
          notification_id: string
          user_id: string
        }
        Insert: {
          dismissed_at?: string
          id?: string
          notification_id: string
          user_id: string
        }
        Update: {
          dismissed_at?: string
          id?: string
          notification_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dismissed_notifications_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      dismissed_promotions: {
        Row: {
          dismissed_at: string
          id: string
          promotion_id: string
          user_id: string
        }
        Insert: {
          dismissed_at?: string
          id?: string
          promotion_id: string
          user_id: string
        }
        Update: {
          dismissed_at?: string
          id?: string
          promotion_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dismissed_promotions_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      free_tool_usage: {
        Row: {
          id: string
          tool_id: string
          usage_date: string
          used_at: string
          user_id: string
        }
        Insert: {
          id?: string
          tool_id: string
          usage_date?: string
          used_at?: string
          user_id: string
        }
        Update: {
          id?: string
          tool_id?: string
          usage_date?: string
          used_at?: string
          user_id?: string
        }
        Relationships: []
      }
      image_generations: {
        Row: {
          created_at: string
          id: string
          image_url: string
          prompt: string
          style_preset: string
          template_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          prompt: string
          style_preset?: string
          template_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          prompt?: string
          style_preset?: string
          template_type?: string
          user_id?: string
        }
        Relationships: []
      }
      infobase: {
        Row: {
          additional_context: string | null
          brand_name: string
          created_at: string
          description: string | null
          id: string
          industry: string | null
          products_services: string | null
          target_audience: string | null
          tone_of_voice: string | null
          unique_selling_points: string | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          additional_context?: string | null
          brand_name: string
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          products_services?: string | null
          target_audience?: string | null
          tone_of_voice?: string | null
          unique_selling_points?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          additional_context?: string | null
          brand_name?: string
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          products_services?: string | null
          target_audience?: string | null
          tone_of_voice?: string | null
          unique_selling_points?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          message: string
          target_users: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          message: string
          target_users?: string | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          message?: string
          target_users?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      pinned_templates: {
        Row: {
          id: string
          pinned_at: string
          pinned_by: string
          template_id: string
        }
        Insert: {
          id?: string
          pinned_at?: string
          pinned_by: string
          template_id: string
        }
        Update: {
          id?: string
          pinned_at?: string
          pinned_by?: string
          template_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          subscription_end_date: string | null
          subscription_plan: string | null
          subscription_start_date: string | null
          updated_at: string
          user_id: string
          words_limit: number | null
          words_used: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          subscription_end_date?: string | null
          subscription_plan?: string | null
          subscription_start_date?: string | null
          updated_at?: string
          user_id: string
          words_limit?: number | null
          words_used?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          subscription_end_date?: string | null
          subscription_plan?: string | null
          subscription_start_date?: string | null
          updated_at?: string
          user_id?: string
          words_limit?: number | null
          words_used?: number | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          button_link: string | null
          button_text: string | null
          created_at: string
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          message: string
          show_on_dashboard: boolean | null
          show_on_landing: boolean | null
          start_date: string | null
          target_users: string | null
          title: string
          updated_at: string
        }
        Insert: {
          button_link?: string | null
          button_text?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          message: string
          show_on_dashboard?: boolean | null
          show_on_landing?: boolean | null
          start_date?: string | null
          target_users?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          button_link?: string | null
          button_text?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          message?: string
          show_on_dashboard?: boolean | null
          show_on_landing?: boolean | null
          start_date?: string | null
          target_users?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      subtasks: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          position: number
          task_id: string
          title: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          position?: number
          task_id: string
          title: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          position?: number
          task_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_activity_log: {
        Row: {
          action: string
          created_at: string
          id: string
          new_value: Json | null
          old_value: Json | null
          task_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          task_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_activity_log_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_label_assignments: {
        Row: {
          created_at: string
          id: string
          label_id: string
          task_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label_id: string
          task_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_label_assignments_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "task_labels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_label_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_labels: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      task_shares: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_public: boolean
          permission: string
          share_token: string | null
          shared_by: string
          shared_with_email: string | null
          task_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_public?: boolean
          permission?: string
          share_token?: string | null
          shared_by: string
          shared_with_email?: string | null
          task_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_public?: boolean
          permission?: string
          share_token?: string | null
          shared_by?: string
          shared_with_email?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_shares_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          created_at: string
          description: string | null
          description_template: string | null
          id: string
          is_shared: boolean
          label_ids: string[] | null
          name: string
          priority: string
          title_template: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_template?: string | null
          id?: string
          is_shared?: boolean
          label_ids?: string[] | null
          name: string
          priority?: string
          title_template: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_template?: string | null
          id?: string
          is_shared?: boolean
          label_ids?: string[] | null
          name?: string
          priority?: string
          title_template?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_time_entries: {
        Row: {
          created_at: string
          description: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          started_at: string
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          recurrence_end_date: string | null
          recurrence_pattern: string | null
          reminder_time: string | null
          status: string
          template_type: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          reminder_time?: string | null
          status?: string
          template_type?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          reminder_time?: string | null
          status?: string
          template_type?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workflow_history: {
        Row: {
          action_type: string
          content_preview: string | null
          created_at: string
          id: string
          result_preview: string | null
          source_title: string | null
          source_type: string
          user_id: string
        }
        Insert: {
          action_type: string
          content_preview?: string | null
          created_at?: string
          id?: string
          result_preview?: string | null
          source_title?: string | null
          source_type: string
          user_id: string
        }
        Update: {
          action_type?: string
          content_preview?: string | null
          created_at?: string
          id?: string
          result_preview?: string | null
          source_title?: string | null
          source_type?: string
          user_id?: string
        }
        Relationships: []
      }
      workflow_schedules: {
        Row: {
          action_type: string
          content: string
          created_at: string
          error: string | null
          executed_at: string | null
          id: string
          options: Json
          result: string | null
          scheduled_for: string
          source_title: string | null
          source_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_type: string
          content: string
          created_at?: string
          error?: string | null
          executed_at?: string | null
          id?: string
          options?: Json
          result?: string | null
          scheduled_for: string
          source_title?: string | null
          source_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_type?: string
          content?: string
          created_at?: string
          error?: string | null
          executed_at?: string | null
          id?: string
          options?: Json
          result?: string | null
          scheduled_for?: string
          source_title?: string | null
          source_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workflow_templates: {
        Row: {
          actions: Json
          created_at: string
          description: string | null
          id: string
          name: string
          source_types: string[]
          updated_at: string
          use_brand_context: boolean
          user_id: string
        }
        Insert: {
          actions?: Json
          created_at?: string
          description?: string | null
          id?: string
          name: string
          source_types?: string[]
          updated_at?: string
          use_brand_context?: boolean
          user_id: string
        }
        Update: {
          actions?: Json
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          source_types?: string[]
          updated_at?: string
          use_brand_context?: boolean
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_discount_code: {
        Args: { discount_code_text: string; user_uuid: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { user_uuid: string }; Returns: boolean }
      is_admin_by_user_id: { Args: { _user_id: string }; Returns: boolean }
      trigger_subscription_expiration: { Args: never; Returns: undefined }
      update_word_usage: {
        Args: { user_uuid: string; words_to_add: number }
        Returns: undefined
      }
      validate_discount_code: {
        Args: { discount_code_text: string; user_uuid: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
