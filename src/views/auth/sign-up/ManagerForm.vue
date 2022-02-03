<template lang="pug">
.manager-form
  div
    .d-flex.flex-column.flex-sm-row
      v-text-field.mr-sm-4(
        autofocus
        label='First name'
        hint='Enter your full legal first name'
        placeholder='Bobby'
        v-model='form.firstName'
        :rules='rules.firstName'
        required
        outlined
        dense
      )
      v-text-field(
        label='Last name'
        hint='Enter your full legal last name'
        placeholder='Tables'
        v-model='form.lastName'
        :rules='rules.lastName'
        required
        outlined
        dense
      )

    .d-flex.flex-column.flex-sm-row(v-if='!retry')
      phone-input.mr-sm-4(
        v-model="form.phone"
        :required='true'
        outlined
        dense
      )

      v-text-field(
        label='Email'
        type='email'
        placeholder='bobby@example.com'
        required
        v-model='form.email'
        :rules='rules.email'
        outlined
        dense
      )
    
    div(v-if='!retry')
      v-text-field(
        label='Password'
        :type="showPassword ? 'text' : 'password'"
        v-model='form.password'
        :rules='rules.password'
        required
        outlined
        dense
        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append='showPassword = !showPassword'
      )
      v-text-field(
        v-if='!showPassword'
        label='Confirm password'
        type='password'
        v-model='form.confirm_password'
        :rules="[...rules.confirmPassword, rules.passwordMatches(form.password, form.confirm_password)]"
        required
        outlined
        dense
      )

    v-subheader Business information

    .d-flex.flex-column.flex-sm-row
      v-text-field.mr-sm-4(
        label='Legal business name'
        hint='As filed with your Secretary of State'
        placeholder='Worxstr'
        v-model='form.businessName'
        :rules='rules.businessName'
        required
        outlined
        dense
      )
      v-select(
        label='Business type'
        v-model='form.businessType'
        :rules='rules.businessType'
        :items='businessTypes'
        item-text='text'
        item-value='value'
        outlined
        dense
      )
  
  v-slide-y-transition
    div(v-if='form.businessType')

      v-text-field.mr-sm-4(
        label='Doing business as'
        placeholder='My name'
        v-model='form.doingBusinessAs'
        required
        outlined
        dense
      )

      .d-flex.flex-column.flex-sm-row
        v-text-field.mr-sm-4(
          label='Business address 1'
          hint='As filed with your Secretary of State. P.O. Boxes are not allowed'
          placeholder='1234 Main St.'
          v-model='form.address1'
          :rules='rules.address1'
          required
          outlined
          dense
        )
        v-text-field(
          label='Business address 2'
          placeholder='Apt. 123'
          v-model='form.address2'
          required
          outlined
          dense
        )

      .d-flex.flex-column.flex-sm-row
        v-text-field.mr-sm-4(
          label='City'
          placeholder='City'
          v-model='form.city'
          :rules='rules.city'
          required
          outlined
          dense
        )
        v-select.mr-sm-4(
          label='State'
          :items='states'
          item-text='text'
          item-value='value'
          v-model='form.state'
          :rules='rules.state'
          outlined
          dense
          required
        )
        v-text-field.hide-arrow-buttons(
          label='Postal code'
          placeholder='12345'
          type='number'
          v-mask="'#####'"
          v-model='form.postalCode'
          :rules='rules.postalCode'
          required
          outlined
          dense
        )
        
      .d-flex.flex-column.flex-sm-row
        v-select.mr-sm-4(
          label='Business type'
          v-model='form.businessClassificationCategory'
          :rules='rules.businessClassificationCategory'
          :items='classifications'
          outlined
          dense
        )
        v-select(
          :disabled='!form.businessClassificationCategory'
          label='Industry'
          v-model='form.businessClassification'
          :rules='rules.industry'
          :items='getIndustries(form.businessClassificationCategory)'
          item-text='name'
          item-value='id'
          outlined
          dense
        )

      v-text-field(
        label='Employer identification number'
        placeholder='00-0000000'
        v-mask="'##-#######'"
        v-model='form.ein'
        :rules='rules.ein'
        required
        outlined
        dense
      )
      
      v-checkbox.mt-0(
        v-if="form.businessType != 'soleProprietorship'"
        v-model='isCompanyController'
        required
      )
        template(v-slot:label)
          span.mr-2 I am also a company controller
          v-tooltip(bottom max-width='300')
            | A person significant responsibility (e.g., CEO, CFO, VP, Treasurer) for managing the business on this account.
            template(v-slot:activator='{on}')
              v-icon(v-on='on') mdi-help-circle-outline

  v-slide-y-transition
    div(v-if='form.ein')
      div(v-if="form.businessType == 'soleProprietorship'")
        v-subheader Sole proprietor verification

        .d-flex.flex-column.flex-sm-row
          v-text-field.mr-sm-4(
            label='Date of birth'
            type="date",
            v-model='form.dateOfBirth'
            :rules='rules.dateOfBirth'
            outlined
            dense
            required
          )
          ssn-input(:short='!retry' v-model='form.ssn')
      
      div(v-else)
        v-subheader {{ isCompanyController ? 'User' : 'Controller' }} verification

        .d-flex.flex-column.flex-sm-row(v-if='!isCompanyController')
          v-text-field.mr-sm-4(
            label='First name'
            hint='Enter the controller\'s full legal first name'
            placeholder='Bobby'
            v-model='form.controller.firstName'
            :rules='rules.firstName'
            required
            outlined
            dense
          )
          v-text-field(
            label='Last name'
            hint='Enter the controller\'s full legal last name'
            placeholder='Tables'
            v-model='form.controller.lastName'
            :rules='rules.lastName'
            required
            outlined
            dense
          )

        .d-flex.flex-column.flex-sm-row
          v-text-field.mr-sm-4(
            label='Title'
            placeholder='CEO'
            v-model='form.controller.title'
            :rules='rules.title'
            required
            outlined
            dense
          )
          v-text-field(
            label='Date of birth'
            type="date",
            v-model='form.controller.dateOfBirth'
            :rules='rules.dateOfBirth'
            outlined
            dense
            required
          )
        
        v-text-field(
          label='Address 1'
          placeholder='1234 Main St.'
          v-model='form.controller.address.address1'
          :rules='rules.address1'
          required
          outlined
          dense
        )
        .d-flex.flex-column.flex-sm-row
          v-text-field.mr-sm-4(
            label='Address 2'
            placeholder='Apt. 123'
            v-model='form.controller.address.address2'
            required
            outlined
            dense
          )
          v-text-field(
            label='Address 3'
            v-model='form.controller.address.address3'
            required
            outlined
            dense
          )

        .d-flex.flex-column.flex-sm-row
          v-text-field.mr-sm-4(
            label='City'
            placeholder='City'
            v-model='form.controller.address.city'
            :rules='rules.city'
            required
            outlined
            dense
          )
          v-select(
            label='Country'
            :items='countries'
            item-text='text'
            item-value='value'
            v-model='form.controller.address.country'
            :rules='rules.country'
            outlined
            dense
            required
          )
          
        .d-flex.flex-column.flex-sm-row
          v-select.mr-sm-4(
            v-if="form.controller.address.country == 'US'"
            label='State'
            :items='states'
            v-model='form.controller.address.stateProvinceRegion'
            :rules='rules.state'
            outlined
            dense
            required
          )

          v-text-field.mr-sm-4(
            v-else
            label='State or province'
            placeholder='Quebec'
            v-model='form.controller.address.stateProvinceRegion'
            :rules='rules.state'
            outlined
            dense
            required
          )

          v-text-field.hide-arrow-buttons(
            label='Postal code'
            placeholder='12345'
            type='number'
            v-model='form.controller.address.postalCode'
            :rules='rules.postalCodeInternational'
            required
            outlined
            dense
          )

        ssn-input(
          v-if="form.controller.address.country == 'US'"
          :short='!retry'
          v-model='form.controller.ssn'
        )

        v-text-field.hide-arrow-buttons(
          v-else
          type='number'
          label='Passport number'
          v-model='form.controller.passport.number'
          :rules='rules.passportNum'
          placeholder='123456'
          required
          outlined
          dense
        )


</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/camelcase */
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import Arrows from '@/components/Arrows.vue'
import PhoneInput from '@/components/inputs/PhoneInput.vue'
import SsnInput from '@/components/inputs/SsnInput.vue'
import {
  exists,
  emailRules,
  passwordRules,
  passwordMatches,
  postalCodeRules,
  einRules,
} from '@/util/inputValidation'

@Component({
  components: {
    Arrows,
    PhoneInput,
    SsnInput,
  },
})
export default class ManagerForm extends Vue {

  @Prop({ default: false }) retry!: boolean

  form: any = {
    controller: {
      address: {
        country: 'US',
      },
      passport: {
        country: '',
        number: '',
      }
    },
  }
  showPassword = false
  isCompanyController = false

  states = [
    'AL',
    'AS',
    'AZ',
    'AR',
    'CA',
    'CO',
    'CT',
    'DC',
    'DE',
    'FL',
    'GA',
    'GU',
    'HI',
    'ID',
    'IL',
    'IN',
    'IA',
    'KS',
    'KY',
    'LA',
    'ME',
    'MD',
    'MA',
    'MI',
    'MN',
    'MP',
    'MS',
    'MO',
    'MT',
    'NE',
    'NV',
    'NH',
    'NJ',
    'NM',
    'NY',
    'NC',
    'ND',
    'OH',
    'OK',
    'OR',
    'PA',
    'PR',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UM',
    'UT',
    'VT',
    'VI',
    'VA',
    'WA',
    'WV',
    'WI',
    'WY',
  ]
  countries = [
    {
      text: 'United States of America',
      value: 'US',
    },
    {
      text: 'Afghanistan',
      value: 'AF',
    },
    {
      text: 'Albania',
      value: 'AL',
    },
    {
      text: 'Algeria',
      value: 'DZ',
    },
    {
      text: 'American Samoa',
      value: 'AS',
    },
    {
      text: 'Andorra',
      value: 'AD',
    },
    {
      text: 'Angola',
      value: 'AO',
    },
    {
      text: 'Anguilla',
      value: 'AI',
    },
    {
      text: 'Antarctica',
      value: 'AQ',
    },
    {
      text: 'Antigua and Barbuda',
      value: 'AG',
    },
    {
      text: 'Argentina',
      value: 'AR',
    },
    {
      text: 'Armenia',
      value: 'AM',
    },
    {
      text: 'Aruba',
      value: 'AW',
    },
    {
      text: 'Australia',
      value: 'AU',
    },
    {
      text: 'Austria',
      value: 'AT',
    },
    {
      text: 'Azerbaijan',
      value: 'AZ',
    },
    {
      text: 'Bahamas',
      value: 'BS',
    },
    {
      text: 'Bahrain',
      value: 'BH',
    },
    {
      text: 'Bangladesh',
      value: 'BD',
    },
    {
      text: 'Barbados',
      value: 'BB',
    },
    {
      text: 'Belarus',
      value: 'BY',
    },
    {
      text: 'Belgium',
      value: 'BE',
    },
    {
      text: 'Belize',
      value: 'BZ',
    },
    {
      text: 'Benin',
      value: 'BJ',
    },
    {
      text: 'Bermuda',
      value: 'BM',
    },
    {
      text: 'Bhutan',
      value: 'BT',
    },
    {
      text: 'Bolivia',
      value: 'BO',
    },
    {
      text: 'Bosnia and Herzegovina',
      value: 'BA',
    },
    {
      text: 'Botswana',
      value: 'BW',
    },
    {
      text: 'Bouvet Island',
      value: 'BV',
    },
    {
      text: 'Brazil',
      value: 'BR',
    },
    {
      text: 'British Indian Ocean Territory',
      value: 'IO',
    },
    {
      text: 'Brunei Darussalam',
      value: 'BN',
    },
    {
      text: 'Bulgaria',
      value: 'BG',
    },
    {
      text: 'Burkina Faso',
      value: 'BF',
    },
    {
      text: 'Burundi',
      value: 'BI',
    },
    {
      text: 'Cambodia',
      value: 'KH',
    },
    {
      text: 'Cameroon',
      value: 'CM',
    },
    {
      text: 'Canada',
      value: 'CA',
    },
    {
      text: 'Cape Verde',
      value: 'CV',
    },
    {
      text: 'Cayman Islands',
      value: 'KY',
    },
    {
      text: 'Central African Republic',
      value: 'CF',
    },
    {
      text: 'Chad',
      value: 'TD',
    },
    {
      text: 'Chile',
      value: 'CL',
    },
    {
      text: 'China',
      value: 'CN',
    },
    {
      text: 'Christmas Island',
      value: 'CX',
    },
    {
      text: 'Cocos (Keeling) Islands',
      value: 'CC',
    },
    {
      text: 'Colombia',
      value: 'CO',
    },
    {
      text: 'Comoros',
      value: 'KM',
    },
    {
      text: 'Congo',
      value: 'CG',
    },
    {
      text: 'Congo, the Democratic Republic of the',
      value: 'CD',
    },
    {
      text: 'Cook Islands',
      value: 'CK',
    },
    {
      text: 'Costa Rica',
      value: 'CR',
    },
    {
      text: "Cote D'Ivoire",
      value: 'CI',
    },
    {
      text: 'Croatia',
      value: 'HR',
    },
    {
      text: 'Cuba',
      value: 'CU',
    },
    {
      text: 'Cyprus',
      value: 'CY',
    },
    {
      text: 'Czech Republic',
      value: 'CZ',
    },
    {
      text: 'Denmark',
      value: 'DK',
    },
    {
      text: 'Djibouti',
      value: 'DJ',
    },
    {
      text: 'Dominica',
      value: 'DM',
    },
    {
      text: 'Dominican Republic',
      value: 'DO',
    },
    {
      text: 'Ecuador',
      value: 'EC',
    },
    {
      text: 'Egypt',
      value: 'EG',
    },
    {
      text: 'El Salvador',
      value: 'SV',
    },
    {
      text: 'Equatorial Guinea',
      value: 'GQ',
    },
    {
      text: 'Eritrea',
      value: 'ER',
    },
    {
      text: 'Estonia',
      value: 'EE',
    },
    {
      text: 'Ethiopia',
      value: 'ET',
    },
    {
      text: 'Falkland Islands (Malvinas)',
      value: 'FK',
    },
    {
      text: 'Faroe Islands',
      value: 'FO',
    },
    {
      text: 'Fiji',
      value: 'FJ',
    },
    {
      text: 'Finland',
      value: 'FI',
    },
    {
      text: 'France',
      value: 'FR',
    },
    {
      text: 'French Guiana',
      value: 'GF',
    },
    {
      text: 'French Polynesia',
      value: 'PF',
    },
    {
      text: 'French Southern Territories',
      value: 'TF',
    },
    {
      text: 'Gabon',
      value: 'GA',
    },
    {
      text: 'Gambia',
      value: 'GM',
    },
    {
      text: 'Georgia',
      value: 'GE',
    },
    {
      text: 'Germany',
      value: 'DE',
    },
    {
      text: 'Ghana',
      value: 'GH',
    },
    {
      text: 'Gibraltar',
      value: 'GI',
    },
    {
      text: 'Greece',
      value: 'GR',
    },
    {
      text: 'Greenland',
      value: 'GL',
    },
    {
      text: 'Grenada',
      value: 'GD',
    },
    {
      text: 'Guadeloupe',
      value: 'GP',
    },
    {
      text: 'Guam',
      value: 'GU',
    },
    {
      text: 'Guatemala',
      value: 'GT',
    },
    {
      text: 'Guinea',
      value: 'GN',
    },
    {
      text: 'Guinea-Bissau',
      value: 'GW',
    },
    {
      text: 'Guyana',
      value: 'GY',
    },
    {
      text: 'Haiti',
      value: 'HT',
    },
    {
      text: 'Heard Island and Mcdonald Islands',
      value: 'HM',
    },
    {
      text: 'Holy See (Vatican City State)',
      value: 'VA',
    },
    {
      text: 'Honduras',
      value: 'HN',
    },
    {
      text: 'Hong Kong',
      value: 'HK',
    },
    {
      text: 'Hungary',
      value: 'HU',
    },
    {
      text: 'Iceland',
      value: 'IS',
    },
    {
      text: 'India',
      value: 'IN',
    },
    {
      text: 'Indonesia',
      value: 'ID',
    },
    {
      text: 'Iran, Islamic Republic of',
      value: 'IR',
    },
    {
      text: 'Iraq',
      value: 'IQ',
    },
    {
      text: 'Ireland',
      value: 'IE',
    },
    {
      text: 'Israel',
      value: 'IL',
    },
    {
      text: 'Italy',
      value: 'IT',
    },
    {
      text: 'Jamaica',
      value: 'JM',
    },
    {
      text: 'Japan',
      value: 'JP',
    },
    {
      text: 'Jordan',
      value: 'JO',
    },
    {
      text: 'Kazakhstan',
      value: 'KZ',
    },
    {
      text: 'Kenya',
      value: 'KE',
    },
    {
      text: 'Kiribati',
      value: 'KI',
    },
    {
      text: 'North Korea',
      value: 'KP',
    },
    {
      text: 'South Korea',
      value: 'KR',
    },
    {
      text: 'Kuwait',
      value: 'KW',
    },
    {
      text: 'Kyrgyzstan',
      value: 'KG',
    },
    {
      text: "Lao People's Democratic Republic",
      value: 'LA',
    },
    {
      text: 'Latvia',
      value: 'LV',
    },
    {
      text: 'Lebanon',
      value: 'LB',
    },
    {
      text: 'Lesotho',
      value: 'LS',
    },
    {
      text: 'Liberia',
      value: 'LR',
    },
    {
      text: 'Libyan Arab Jamahiriya',
      value: 'LY',
    },
    {
      text: 'Liechtenstein',
      value: 'LI',
    },
    {
      text: 'Lithuania',
      value: 'LT',
    },
    {
      text: 'Luxembourg',
      value: 'LU',
    },
    {
      text: 'Macao',
      value: 'MO',
    },
    {
      text: 'Macedonia, the Former Yugoslav Republic of',
      value: 'MK',
    },
    {
      text: 'Madagascar',
      value: 'MG',
    },
    {
      text: 'Malawi',
      value: 'MW',
    },
    {
      text: 'Malaysia',
      value: 'MY',
    },
    {
      text: 'Maldives',
      value: 'MV',
    },
    {
      text: 'Mali',
      value: 'ML',
    },
    {
      text: 'Malta',
      value: 'MT',
    },
    {
      text: 'Marshall Islands',
      value: 'MH',
    },
    {
      text: 'Martinique',
      value: 'MQ',
    },
    {
      text: 'Mauritania',
      value: 'MR',
    },
    {
      text: 'Mauritius',
      value: 'MU',
    },
    {
      text: 'Mayotte',
      value: 'YT',
    },
    {
      text: 'Mexico',
      value: 'MX',
    },
    {
      text: 'Micronesia, Federated States of',
      value: 'FM',
    },
    {
      text: 'Moldova, Republic of',
      value: 'MD',
    },
    {
      text: 'Monaco',
      value: 'MC',
    },
    {
      text: 'Mongolia',
      value: 'MN',
    },
    {
      text: 'Montserrat',
      value: 'MS',
    },
    {
      text: 'Morocco',
      value: 'MA',
    },
    {
      text: 'Mozambique',
      value: 'MZ',
    },
    {
      text: 'Myanmar',
      value: 'MM',
    },
    {
      text: 'Namibia',
      value: 'NA',
    },
    {
      text: 'Nauru',
      value: 'NR',
    },
    {
      text: 'Nepal',
      value: 'NP',
    },
    {
      text: 'Netherlands',
      value: 'NL',
    },
    {
      text: 'New Caledonia',
      value: 'NC',
    },
    {
      text: 'New Zealand',
      value: 'NZ',
    },
    {
      text: 'Nicaragua',
      value: 'NI',
    },
    {
      text: 'Niger',
      value: 'NE',
    },
    {
      text: 'Nigeria',
      value: 'NG',
    },
    {
      text: 'Niue',
      value: 'NU',
    },
    {
      text: 'Norfolk Island',
      value: 'NF',
    },
    {
      text: 'Northern Mariana Islands',
      value: 'MP',
    },
    {
      text: 'Norway',
      value: 'NO',
    },
    {
      text: 'Oman',
      value: 'OM',
    },
    {
      text: 'Pakistan',
      value: 'PK',
    },
    {
      text: 'Palau',
      value: 'PW',
    },
    {
      text: 'Palestinian Territory, Occupied',
      value: 'PS',
    },
    {
      text: 'Panama',
      value: 'PA',
    },
    {
      text: 'Papua New Guinea',
      value: 'PG',
    },
    {
      text: 'Paraguay',
      value: 'PY',
    },
    {
      text: 'Peru',
      value: 'PE',
    },
    {
      text: 'Philippines',
      value: 'PH',
    },
    {
      text: 'Pitcairn',
      value: 'PN',
    },
    {
      text: 'Poland',
      value: 'PL',
    },
    {
      text: 'Portugal',
      value: 'PT',
    },
    {
      text: 'Puerto Rico',
      value: 'PR',
    },
    {
      text: 'Qatar',
      value: 'QA',
    },
    {
      text: 'Reunion',
      value: 'RE',
    },
    {
      text: 'Romania',
      value: 'RO',
    },
    {
      text: 'Russian Federation',
      value: 'RU',
    },
    {
      text: 'Rwanda',
      value: 'RW',
    },
    {
      text: 'Saint Helena',
      value: 'SH',
    },
    {
      text: 'Saint Kitts and Nevis',
      value: 'KN',
    },
    {
      text: 'Saint Lucia',
      value: 'LC',
    },
    {
      text: 'Saint Pierre and Miquelon',
      value: 'PM',
    },
    {
      text: 'Saint Vincent and the Grenadines',
      value: 'VC',
    },
    {
      text: 'Samoa',
      value: 'WS',
    },
    {
      text: 'San Marino',
      value: 'SM',
    },
    {
      text: 'Sao Tome and Principe',
      value: 'ST',
    },
    {
      text: 'Saudi Arabia',
      value: 'SA',
    },
    {
      text: 'Senegal',
      value: 'SN',
    },
    {
      text: 'Seychelles',
      value: 'SC',
    },
    {
      text: 'Sierra Leone',
      value: 'SL',
    },
    {
      text: 'Singapore',
      value: 'SG',
    },
    {
      text: 'Slovakia',
      value: 'SK',
    },
    {
      text: 'Slovenia',
      value: 'SI',
    },
    {
      text: 'Solomon Islands',
      value: 'SB',
    },
    {
      text: 'Somalia',
      value: 'SO',
    },
    {
      text: 'South Africa',
      value: 'ZA',
    },
    {
      text: 'South Georgia and the South Sandwich Islands',
      value: 'GS',
    },
    {
      text: 'Spain',
      value: 'ES',
    },
    {
      text: 'Sri Lanka',
      value: 'LK',
    },
    {
      text: 'Sudan',
      value: 'SD',
    },
    {
      text: 'Suriname',
      value: 'SR',
    },
    {
      text: 'Svalbard and Jan Mayen',
      value: 'SJ',
    },
    {
      text: 'Swaziland',
      value: 'SZ',
    },
    {
      text: 'Sweden',
      value: 'SE',
    },
    {
      text: 'Switzerland',
      value: 'CH',
    },
    {
      text: 'Syrian Arab Republic',
      value: 'SY',
    },
    {
      text: 'Taiwan',
      value: 'TW',
    },
    {
      text: 'Tajikistan',
      value: 'TJ',
    },
    {
      text: 'Tanzania, United Republic of',
      value: 'TZ',
    },
    {
      text: 'Thailand',
      value: 'TH',
    },
    {
      text: 'Timor-Leste',
      value: 'TL',
    },
    {
      text: 'Togo',
      value: 'TG',
    },
    {
      text: 'Tokelau',
      value: 'TK',
    },
    {
      text: 'Tonga',
      value: 'TO',
    },
    {
      text: 'Trinidad and Tobago',
      value: 'TT',
    },
    {
      text: 'Tunisia',
      value: 'TN',
    },
    {
      text: 'Turkey',
      value: 'TR',
    },
    {
      text: 'Turkmenistan',
      value: 'TM',
    },
    {
      text: 'Turks and Caicos Islands',
      value: 'TC',
    },
    {
      text: 'Tuvalu',
      value: 'TV',
    },
    {
      text: 'Uganda',
      value: 'UG',
    },
    {
      text: 'Ukraine',
      value: 'UA',
    },
    {
      text: 'United Arab Emirates',
      value: 'AE',
    },
    {
      text: 'United Kingdom',
      value: 'GB',
    },
    {
      text: 'United States Minor Outlying Islands',
      value: 'UM',
    },
    {
      text: 'Uruguay',
      value: 'UY',
    },
    {
      text: 'Uzbekistan',
      value: 'UZ',
    },
    {
      text: 'Vanuatu',
      value: 'VU',
    },
    {
      text: 'Venezuela',
      value: 'VE',
    },
    {
      text: 'Viet Nam',
      value: 'VN',
    },
    {
      text: 'Virgin Islands, British',
      value: 'VG',
    },
    {
      text: 'Virgin Islands, U.S.',
      value: 'VI',
    },
    {
      text: 'Wallis and Futuna',
      value: 'WF',
    },
    {
      text: 'Western Sahara',
      value: 'EH',
    },
    {
      text: 'Yemen',
      value: 'YE',
    },
    {
      text: 'Zambia',
      value: 'ZM',
    },
    {
      text: 'Zimbabwe',
      value: 'ZW',
    },
    {
      text: 'Åland Islands',
      value: 'AX',
    },
    {
      text: 'Bonaire, Sint Eustatius and Saba',
      value: 'BQ',
    },
    {
      text: 'Curaçao',
      value: 'CW',
    },
    {
      text: 'Guernsey',
      value: 'GG',
    },
    {
      text: 'Isle of Man',
      value: 'IM',
    },
    {
      text: 'Jersey',
      value: 'JE',
    },
    {
      text: 'Montenegro',
      value: 'ME',
    },
    {
      text: 'Saint Barthélemy',
      value: 'BL',
    },
    {
      text: 'Saint Martin (French part)',
      value: 'MF',
    },
    {
      text: 'Serbia',
      value: 'RS',
    },
    {
      text: 'Sint Maarten (Dutch part)',
      value: 'SX',
    },
    {
      text: 'South Sudan',
      value: 'SS',
    },
    {
      text: 'Kosovo',
      value: 'XK',
    },
  ]
  businessTypes = [
    {
      text: 'Sole Proprietorship',
      value: 'soleProprietorship',
    },
    {
      text: 'Corporation',
      value: 'corporation',
    },
        {
      text: 'LLC',
      value: 'llc',
    },
    {
      text: 'Partnership',
      value: 'partnership',
    },
  ]
  // TODO: Use Dwolla API to fetch these categories
  businessClassifications = [
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed3f669-7d6f-11e3-b545-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed3f671-7d6f-11e3-803c-5404a6144203',
            name: 'Gourmet foods',
          },
          {
            id: '9ed3f66c-7d6f-11e3-86ae-5404a6144203',
            name: 'Distilleries',
          },
          {
            id: '9ed3f66a-7d6f-11e3-8acd-5404a6144203',
            name: 'Breweries',
          },
          {
            id: '9ed3f66d-7d6f-11e3-9101-5404a6144203',
            name: 'Alcoholic beverage drinking places',
          },
          {
            id: '9ed3f66e-7d6f-11e3-9480-5404a6144203',
            name: 'Beer, wine, and liquor store',
          },
          {
            id: '9ed3f66b-7d6f-11e3-95ac-5404a6144203',
            name: 'Wineries',
          },
          {
            id: '9ed3f674-7d6f-11e3-9619-5404a6144203',
            name: 'Tobacco',
          },
          {
            id: '9ed3f673-7d6f-11e3-adb1-5404a6144203',
            name: 'Restaurant',
          },
          {
            id: '9ed3f676-7d6f-11e3-af8e-5404a6144203',
            name: 'Supplement store',
          },
          {
            id: '9ed3f675-7d6f-11e3-afad-5404a6144203',
            name: 'Pharmacy and drugstore',
          },
          {
            id: '9ed3f670-7d6f-11e3-b1ce-5404a6144203',
            name: 'Coffee and tea',
          },
          {
            id: '9ed3f66f-7d6f-11e3-b1df-5404a6144203',
            name: 'Catering services',
          },
          {
            id: '9ed3f672-7d6f-11e3-b67a-5404a6144203',
            name: 'Specialty and miscellaneous food store',
          },
        ],
      },
      id: '9ed3f669-7d6f-11e3-b545-5404a6144203',
      name: 'Food retail and service',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed41d89-7d6f-11e3-beff-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed41d96-7d6f-11e3-804a-5404a6144203',
            name: 'Nonmetallic mineral product manufacturing',
          },
          {
            id: '9ed44484-7d6f-11e3-8b25-5404a6144203',
            name: 'Furniture and related product manufacturing',
          },
          {
            id: '9ed41d95-7d6f-11e3-8b36-5404a6144203',
            name: 'Plastics and rubber products manufacturing',
          },
          {
            id: '9ed41d94-7d6f-11e3-8dc3-5404a6144203',
            name: 'Chemical manufacturing',
          },
          {
            id: '9ed41d97-7d6f-11e3-92aa-5404a6144203',
            name: 'Primary metal manufacturing',
          },
          {
            id: '9ed44483-7d6f-11e3-95ce-5404a6144203',
            name: 'Transportation equipment manufacturing',
          },
          {
            id: '9ed41d8f-7d6f-11e3-9762-5404a6144203',
            name: 'Leather and allied product manufacturing',
          },
          {
            id: '9ed41d8d-7d6f-11e3-9a24-5404a6144203',
            name: 'Textile product mills',
          },
          {
            id: '9ed41d92-7d6f-11e3-a0ad-5404a6144203',
            name: 'Printing and related support activities',
          },
          {
            id: '9ed44485-7d6f-11e3-a2bc-5404a6144203',
            name: 'Miscellaneous manufacturing',
          },
          {
            id: '9ed41d8a-7d6f-11e3-a5dc-5404a6144203',
            name: 'Food manufacturing',
          },
          {
            id: '9ed41d98-7d6f-11e3-a88a-5404a6144203',
            name: 'Fabricated metal product manufacturing',
          },
          {
            id: '9ed41d90-7d6f-11e3-a8f0-5404a6144203',
            name: 'Wood product manufacturing',
          },
          {
            id: '9ed44481-7d6f-11e3-aa45-5404a6144203',
            name: 'Computer and electronic product manufacturing',
          },
          {
            id: '9ed41d91-7d6f-11e3-b262-5404a6144203',
            name: 'Paper manufacturing',
          },
          {
            id: '9ed44480-7d6f-11e3-b289-5404a6144203',
            name: 'Machinery manufacturing',
          },
          {
            id: '9ed41d8e-7d6f-11e3-b45c-5404a6144203',
            name: 'Apparel manufacturing',
          },
          {
            id: '9ed41d93-7d6f-11e3-b677-5404a6144203',
            name: 'Petroleum and coal products manufacturing',
          },
          {
            id: '9ed41d8b-7d6f-11e3-b721-5404a6144203',
            name: 'Beverage and tobacco product manufacturing',
          },
          {
            id: '9ed44482-7d6f-11e3-babe-5404a6144203',
            name:
              'Electrical equipment, appliance, and component manufacturing',
          },
          {
            id: '9ed41d8c-7d6f-11e3-bce3-5404a6144203',
            name: 'Textile mills',
          },
        ],
      },
      id: '9ed41d89-7d6f-11e3-beff-5404a6144203',
      name: 'Manufacturing',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed35a3b-7d6f-11e3-83c8-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed38132-7d6f-11e3-815d-5404a6144203',
            name: 'Agriculture - animal production and aquaculture',
          },
          {
            id: '9ed38131-7d6f-11e3-828e-5404a6144203',
            name: 'Agriculture - fruit, vegetable, and crop production',
          },
          {
            id: '9ed3813c-7d6f-11e3-82cc-5404a6144203',
            name: 'Consulting services',
          },
          {
            id: '9ed38134-7d6f-11e3-8529-5404a6144203',
            name: 'Agriculture - fishing, hunting, and trapping',
          },
          {
            id: '9ed38138-7d6f-11e3-862a-5404a6144203',
            name: 'Construction - residential building',
          },
          {
            id: '9ed3813e-7d6f-11e3-86eb-5404a6144203',
            name: 'Consumer goods rental',
          },
          {
            id: '9ed3813f-7d6f-11e3-8840-5404a6144203',
            name: 'Commercial and industrial goods rental',
          },
          {
            id: '9ed38146-7d6f-11e3-89d6-5404a6144203',
            name: 'Marketing',
          },
          {
            id: '9ed3814a-7d6f-11e3-8c10-5404a6144203',
            name: 'Publishing',
          },
          {
            id: '9ed3814d-7d6f-11e3-8eb5-5404a6144203',
            name: 'Shipping and packing',
          },
          {
            id: '9ed3814e-7d6f-11e3-9087-5404a6144203',
            name: 'Stenographic and secretarial support services',
          },
          {
            id: '9ed38147-7d6f-11e3-94f8-5404a6144203',
            name: 'Multi-level marketing',
          },
          {
            id: '9ed38148-7d6f-11e3-9820-5404a6144203',
            name: 'Office and commercial furniture',
          },
          {
            id: '9ed38133-7d6f-11e3-9892-5404a6144203',
            name: 'Agriculture - forestry and logging',
          },
          {
            id: '9ed3814b-7d6f-11e3-9ed9-5404a6144203',
            name: 'Printing',
          },
          {
            id: '9ed38145-7d6f-11e3-a442-5404a6144203',
            name: 'Mailing lists',
          },
          {
            id: '9ed38144-7d6f-11e3-a4f3-5404a6144203',
            name: 'Industrial and manufacturing supplies',
          },
          {
            id: '9ed38141-7d6f-11e3-a5d2-5404a6144203',
            name: 'Commercial and industrial goods repair and maintenance',
          },
          {
            id: '9ed3814c-7d6f-11e3-a77b-5404a6144203',
            name: 'Quick copy and reproduction services',
          },
          {
            id: '9ed38137-7d6f-11e3-a92b-5404a6144203',
            name: 'Commercial photography, art, and graphics',
          },
          {
            id: '9ed38135-7d6f-11e3-a9f8-5404a6144203',
            name: 'Architectural, engineering, and surveying services',
          },
          {
            id: '9ed3814f-7d6f-11e3-aaf6-5404a6144203',
            name: 'Wholesale - durable goods',
          },
          {
            id: '9ed38142-7d6f-11e3-ab4a-5404a6144203',
            name: 'Consumer goods repair and maintenance',
          },
          {
            id: '9ed38150-7d6f-11e3-adfb-5404a6144203',
            name: 'Wholesale - nondurable goods',
          },
          {
            id: '9ed38130-7d6f-11e3-afd9-5404a6144203',
            name: 'Advertising and public relations',
          },
          {
            id: '9ed3813b-7d6f-11e3-b28d-5404a6144203',
            name: 'Construction - specialty trade contractors',
          },
          {
            id: '9ed38149-7d6f-11e3-b520-5404a6144203',
            name: 'Office supplies and equipment',
          },
          {
            id: '9ed38143-7d6f-11e3-bc00-5404a6144203',
            name: 'Career services',
          },
          {
            id: '9ed38140-7d6f-11e3-bc03-5404a6144203',
            name: 'Electronic repair and maintenance',
          },
          {
            id: '9ed38151-7d6f-11e3-bc8f-5404a6144203',
            name: 'Wholesale - electronic markets and agents and brokers',
          },
          {
            id: '9ed3813a-7d6f-11e3-bc90-5404a6144203',
            name: 'Construction - heavy and civil engineering',
          },
          {
            id: '9ed3813d-7d6f-11e3-bd65-5404a6144203',
            name: 'Educational services',
          },
          {
            id: '9ed38136-7d6f-11e3-bd75-5404a6144203',
            name: 'Chemicals and allied products',
          },
          {
            id: '9ed35a3c-7d6f-11e3-be28-5404a6144203',
            name: 'Accounting',
          },
          {
            id: '9ed38139-7d6f-11e3-bf69-5404a6144203',
            name: 'Construction - nonresidential building',
          },
        ],
      },
      id: '9ed35a3b-7d6f-11e3-83c8-5404a6144203',
      name: 'Business to business',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed4449e-7d6f-11e3-a32d-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed46baf-7d6f-11e3-816d-5404a6144203',
            name: 'Online dating',
          },
          {
            id: '9ed492a7-7d6f-11e3-8278-5404a6144203',
            name: 'Vision care',
          },
          {
            id: '9ed46b98-7d6f-11e3-8308-5404a6144203',
            name: 'Consumer goods rental',
          },
          {
            id: '9ed46bac-7d6f-11e3-83b7-5404a6144203',
            name: 'Printing',
          },
          {
            id: '9ed444a1-7d6f-11e3-858e-5404a6144203',
            name: 'All other personal services',
          },
          {
            id: '9ed444a5-7d6f-11e3-85d6-5404a6144203',
            name: 'Cleaning and maintenance',
          },
          {
            id: '9ed46bb2-7d6f-11e3-861c-5404a6144203',
            name: 'Investigation and security services',
          },
          {
            id: '9ed444a8-7d6f-11e3-87fd-5404a6144203',
            name: 'Computer network services',
          },
          {
            id: '9ed492a5-7d6f-11e3-8d8f-5404a6144203',
            name: 'Telecommunication services',
          },
          {
            id: '9ed46b97-7d6f-11e3-8dd7-5404a6144203',
            name: 'Entertainment',
          },
          {
            id: '9ed492a3-7d6f-11e3-8f04-5404a6144203',
            name: 'Swimming pool services',
          },
          {
            id: '9ed444a0-7d6f-11e3-8fb1-5404a6144203',
            name: 'Warehouse clubs and supercenters',
          },
          {
            id: '9ed46bb5-7d6f-11e3-9631-5404a6144203',
            name: 'Real estate agent',
          },
          {
            id: '9ed46b9f-7d6f-11e3-96b0-5404a6144203',
            name: 'Health and beauty spas',
          },
          {
            id: '9ed46b91-7d6f-11e3-9704-5404a6144203',
            name: 'Consulting services',
          },
          {
            id: '9ed46b95-7d6f-11e3-970b-5404a6144203',
            name: 'eCommerce services',
          },
          {
            id: '9ed492a8-7d6f-11e3-9894-5404a6144203',
            name: 'Watch, clock, and jewelry repair',
          },
          {
            id: '9ed492ab-7d6f-11e3-9907-5404a6144203',
            name: 'Real estate - other',
          },
          {
            id: '9ed46bae-7d6f-11e3-9966-5404a6144203',
            name: 'Storage',
          },
          {
            id: '9ed46ba9-7d6f-11e3-9b47-5404a6144203',
            name: 'Medical care',
          },
          {
            id: '9ed492a1-7d6f-11e3-9ccf-5404a6144203',
            name: 'Services not elsewhere classified',
          },
          {
            id: '9ed46ba1-7d6f-11e3-9d1b-5404a6144203',
            name: 'Importing and exporting',
          },
          {
            id: '9ed444a4-7d6f-11e3-9dc4-5404a6144203',
            name: 'Child care services',
          },
          {
            id: '9ed46ba3-7d6f-11e3-9efe-5404a6144203',
            name: 'Insurance - auto and home',
          },
          {
            id: '9ed46b92-7d6f-11e3-9f08-5404a6144203',
            name: 'Counseling services',
          },
          {
            id: '9ed46b9e-7d6f-11e3-9fec-5404a6144203',
            name: 'Graphic and commercial design',
          },
          {
            id: '9ed46bad-7d6f-11e3-a006-5404a6144203',
            name: 'Moving',
          },
          {
            id: '9ed46b9a-7d6f-11e3-a11b-5404a6144203',
            name: 'Event and wedding planning',
          },
          {
            id: '9ed46b96-7d6f-11e3-a2ee-5404a6144203',
            name: 'Electronic repair and maintenance',
          },
          {
            id: '9ed46bb3-7d6f-11e3-a347-5404a6144203',
            name: 'Quick copy and reproduction services',
          },
          {
            id: '9ed46bb0-7d6f-11e3-a35d-5404a6144203',
            name: 'Photofinishing',
          },
          {
            id: '9ed46bb4-7d6f-11e3-a3c3-5404a6144203',
            name: 'Radio, television, and stereo repair',
          },
          {
            id: '9ed46bab-7d6f-11e3-a401-5404a6144203',
            name: 'Publishing',
          },
          {
            id: '9ed46ba8-7d6f-11e3-a726-5404a6144203',
            name: 'Lottery and contests',
          },
          {
            id: '9ed492aa-7d6f-11e3-aca1-5404a6144203',
            name: 'Research and development',
          },
          {
            id: '9ed46bb1-7d6f-11e3-acac-5404a6144203',
            name: 'Photographic studios - portraits',
          },
          {
            id: '9ed444a6-7d6f-11e3-ad1c-5404a6144203',
            name: 'Commercial photography, art, and graphics',
          },
          {
            id: '9ed46b9c-7d6f-11e3-ad21-5404a6144203',
            name: 'Construction - residential building',
          },
          {
            id: '9ed46baa-7d6f-11e3-ad74-5404a6144203',
            name: 'Membership clubs and organizations',
          },
          {
            id: '9ed46b94-7d6f-11e3-ad88-5404a6144203',
            name: 'Dental care',
          },
          {
            id: '9ed46ba6-7d6f-11e3-ae95-5404a6144203',
            name: 'Legal services and attorneys',
          },
          {
            id: '9ed492a9-7d6f-11e3-af4b-5404a6144203',
            name: 'Mining',
          },
          {
            id: '9ed46ba5-7d6f-11e3-b01c-5404a6144203',
            name: 'Landscaping and horticultural',
          },
          {
            id: '9ed46ba2-7d6f-11e3-b242-5404a6144203',
            name: 'Information retrieval services',
          },
          {
            id: '9ed46ba4-7d6f-11e3-b31e-5404a6144203',
            name: 'Insurance - life and annuity',
          },
          {
            id: '9ed46b9b-7d6f-11e3-b391-5404a6144203',
            name: 'Gambling',
          },
          {
            id: '9ed46b93-7d6f-11e3-b3b9-5404a6144203',
            name: 'Courier services',
          },
          {
            id: '9ed492a4-7d6f-11e3-b3dc-5404a6144203',
            name: 'Tailors and alterations',
          },
          {
            id: '9ed444a7-7d6f-11e3-b42d-5404a6144203',
            name: 'Computer and data processing services',
          },
          {
            id: '9ed46b9d-7d6f-11e3-b5da-5404a6144203',
            name: 'Construction - nonresidential building',
          },
          {
            id: '9ed46ba0-7d6f-11e3-b775-5404a6144203',
            name: 'IDs, licenses, and passports',
          },
          {
            id: '9ed444a3-7d6f-11e3-b785-5404a6144203',
            name: 'Carpentry',
          },
          {
            id: '9ed46ba7-7d6f-11e3-b85c-5404a6144203',
            name: 'Local delivery service',
          },
          {
            id: '9ed4449f-7d6f-11e3-b867-5404a6144203',
            name: 'Advertising and public relations',
          },
          {
            id: '9ed46bb7-7d6f-11e3-b950-5404a6144203',
            name: 'Reupholstery and furniture repair',
          },
          {
            id: '9ed46bb6-7d6f-11e3-b9b2-5404a6144203',
            name: 'Rental property management',
          },
          {
            id: '9ed444a2-7d6f-11e3-ba23-5404a6144203',
            name: 'Career services',
          },
          {
            id: '9ed492a6-7d6f-11e3-bbd2-5404a6144203',
            name: 'Utilities',
          },
          {
            id: '9ed46b99-7d6f-11e3-be4c-5404a6144203',
            name: 'Commercial and industrial goods rental',
          },
          {
            id: '9ed492a2-7d6f-11e3-bfb3-5404a6144203',
            name: 'Shipping and packing',
          },
        ],
      },
      id: '9ed4449e-7d6f-11e3-a32d-5404a6144203',
      name: 'Services - other',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed3a866-7d6f-11e3-a0ce-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed3cf58-7d6f-11e3-81a4-5404a6144203',
            name: 'Toys and games',
          },
          {
            id: '9ed3cf50-7d6f-11e3-8ae8-5404a6144203',
            name: 'Music',
          },
          {
            id: '9ed3cf5c-7d6f-11e3-8d0e-5404a6144203',
            name: 'Gambling',
          },
          {
            id: '9ed3cf53-7d6f-11e3-8ee9-5404a6144203',
            name: 'Cable, satellite, and other pay TV and radio broadcasting',
          },
          {
            id: '9ed3cf59-7d6f-11e3-9158-5404a6144203',
            name: 'Slot machines',
          },
          {
            id: '9ed3cf57-7d6f-11e3-921d-5404a6144203',
            name: 'Theater tickets',
          },
          {
            id: '9ed3cf4f-7d6f-11e3-97ea-5404a6144203',
            name: 'Motion picture and video',
          },
          {
            id: '9ed3cf5a-7d6f-11e3-9a99-5404a6144203',
            name: 'Digital content',
          },
          {
            id: '9ed3cf5b-7d6f-11e3-a368-5404a6144203',
            name: 'Entertainers',
          },
          {
            id: '9ed3a867-7d6f-11e3-a6e4-5404a6144203',
            name: 'Memorabilia',
          },
          {
            id: '9ed3cf52-7d6f-11e3-b0da-5404a6144203',
            name: 'Music store - CDs, cassettes and albums',
          },
          {
            id: '9ed3cf5d-7d6f-11e3-b35e-5404a6144203',
            name: 'Online gaming',
          },
          {
            id: '9ed3cf55-7d6f-11e3-b43c-5404a6144203',
            name: 'Adult digital content',
          },
          {
            id: '9ed3cf51-7d6f-11e3-b49f-5404a6144203',
            name: 'Movie store - DVDs, videotapes',
          },
          {
            id: '9ed3cf5e-7d6f-11e3-b9d5-5404a6144203',
            name: 'Video games and systems',
          },
          {
            id: '9ed3cf56-7d6f-11e3-ba87-5404a6144203',
            name: 'Concert tickets',
          },
          {
            id: '9ed3cf54-7d6f-11e3-bf23-5404a6144203',
            name: 'Cable and other subscription programming',
          },
        ],
      },
      id: '9ed3a866-7d6f-11e3-a0ce-5404a6144203',
      name: 'Entertainment and media',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed41d75-7d6f-11e3-b151-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed41d76-7d6f-11e3-81ef-5404a6144203',
            name: 'Antiques',
          },
          {
            id: '9ed41d80-7d6f-11e3-857a-5404a6144203',
            name: 'Glass, paint, and wallpaper',
          },
          {
            id: '9ed41d77-7d6f-11e3-8cda-5404a6144203',
            name: 'Appliances',
          },
          {
            id: '9ed41d7c-7d6f-11e3-8fb6-5404a6144203',
            name: 'Exterminating and disinfecting services',
          },
          {
            id: '9ed41d7b-7d6f-11e3-9534-5404a6144203',
            name: 'Drapery, window covering, and upholstery',
          },
          {
            id: '9ed41d81-7d6f-11e3-9904-5404a6144203',
            name: 'Hardware and tools',
          },
          {
            id: '9ed41d86-7d6f-11e3-9e98-5404a6144203',
            name: 'Rugs and carpets',
          },
          {
            id: '9ed41d7e-7d6f-11e3-a3fc-5404a6144203',
            name: 'Furniture',
          },
          {
            id: '9ed41d7a-7d6f-11e3-ae21-5404a6144203',
            name: 'Construction material',
          },
          {
            id: '9ed41d7f-7d6f-11e3-b918-5404a6144203',
            name: 'Lawn and garden equipment and supplies',
          },
          {
            id: '9ed41d84-7d6f-11e3-bc20-5404a6144203',
            name: 'Home furnishings store',
          },
          {
            id: '9ed41d78-7d6f-11e3-bd3f-5404a6144203',
            name: 'Art dealers and galleries',
          },
        ],
      },
      id: '9ed41d75-7d6f-11e3-b151-5404a6144203',
      name: 'Home and garden',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed35a29-7d6f-11e3-930b-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed35a2d-7d6f-11e3-8284-5404a6144203',
            name: 'Safety and health',
          },
          {
            id: '9ed35a2b-7d6f-11e3-942f-5404a6144203',
            name: 'Furniture',
          },
          {
            id: '9ed35a2a-7d6f-11e3-b976-5404a6144203',
            name: "Children's and baby's clothing",
          },
        ],
      },
      id: '9ed35a29-7d6f-11e3-930b-5404a6144203',
      name: 'Baby',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed492c6-7d6f-11e3-80f4-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed4b9b8-7d6f-11e3-8329-5404a6144203',
            name: 'Tours',
          },
          {
            id: '9ed4b9b0-7d6f-11e3-8f2f-5404a6144203',
            name: 'Bus line',
          },
          {
            id: '9ed492c7-7d6f-11e3-8fc5-5404a6144203',
            name: 'Airline',
          },
          {
            id: '9ed4b9b5-7d6f-11e3-9031-5404a6144203',
            name: 'Sporting and recreation camps',
          },
          {
            id: '9ed4b9b1-7d6f-11e3-9ce7-5404a6144203',
            name: 'Cruises',
          },
          {
            id: '9ed4b9b2-7d6f-11e3-a1d5-5404a6144203',
            name: 'Lodging and accommodations',
          },
          {
            id: '9ed4b9b7-7d6f-11e3-a615-5404a6144203',
            name: 'Timeshares',
          },
          {
            id: '9ed4b9b3-7d6f-11e3-aea7-5404a6144203',
            name: 'Luggage and leather goods',
          },
          {
            id: '9ed4b9bb-7d6f-11e3-af9f-5404a6144203',
            name: 'Travel agency',
          },
          {
            id: '9ed4b9b6-7d6f-11e3-b843-5404a6144203',
            name: 'Taxicabs and limousines',
          },
          {
            id: '9ed492c8-7d6f-11e3-ba44-5404a6144203',
            name: 'Auto rental',
          },
          {
            id: '9ed4b9ba-7d6f-11e3-bbf4-5404a6144203',
            name: 'Transportation services - other',
          },
          {
            id: '9ed4b9b4-7d6f-11e3-bcfd-5404a6144203',
            name: 'Recreational services',
          },
          {
            id: '9ed4b9b9-7d6f-11e3-bf00-5404a6144203',
            name: 'Trailer parks and campgrounds',
          },
        ],
      },
      id: '9ed492c6-7d6f-11e3-80f4-5404a6144203',
      name: 'Travel',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed38152-7d6f-11e3-9042-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed38155-7d6f-11e3-83c3-5404a6144203',
            name: "Women's clothing",
          },
          {
            id: '9ed3a841-7d6f-11e3-954f-5404a6144203',
            name: 'Military and civil service uniforms',
          },
          {
            id: '9ed38153-7d6f-11e3-97e3-5404a6144203',
            name: "Children's and baby's clothing",
          },
          {
            id: '9ed38154-7d6f-11e3-9b0d-5404a6144203',
            name: "Men's clothing",
          },
          {
            id: '9ed3a844-7d6f-11e3-9d68-5404a6144203',
            name: 'Wholesale - precious stones and metals',
          },
          {
            id: '9ed3a840-7d6f-11e3-a314-5404a6144203',
            name: 'Shoes',
          },
          {
            id: '9ed3a845-7d6f-11e3-b307-5404a6144203',
            name: 'Fashion jewelry',
          },
          {
            id: '9ed3a842-7d6f-11e3-bba3-5404a6144203',
            name: 'Accessories',
          },
          {
            id: '9ed3a843-7d6f-11e3-bbb4-5404a6144203',
            name: 'Retail - fine jewelry and watches',
          },
        ],
      },
      id: '9ed38152-7d6f-11e3-9042-5404a6144203',
      name: 'Clothing, accessories, and shoes',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed3f686-7d6f-11e3-af6e-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed41d70-7d6f-11e3-851b-5404a6144203',
            name: 'Dental care',
          },
          {
            id: '9ed41d74-7d6f-11e3-8b34-5404a6144203',
            name: 'Vitamins and supplements',
          },
          {
            id: '9ed41d73-7d6f-11e3-963f-5404a6144203',
            name: 'Vision care',
          },
          {
            id: '9ed3f687-7d6f-11e3-a1ac-5404a6144203',
            name: 'Pharmacy and drugstore',
          },
          {
            id: '9ed41d71-7d6f-11e3-abed-5404a6144203',
            name: 'Medical care',
          },
          {
            id: '9ed41d72-7d6f-11e3-b770-5404a6144203',
            name: 'Medical equipment and supplies',
          },
        ],
      },
      id: '9ed3f686-7d6f-11e3-af6e-5404a6144203',
      name: 'Health and personal care',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed35a2e-7d6f-11e3-a5cf-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed35a2f-7d6f-11e3-8593-5404a6144203',
            name: 'Bath and body',
          },
          {
            id: '9ed35a30-7d6f-11e3-b9d5-5404a6144203',
            name: 'Fragrances and perfumes',
          },
          {
            id: '9ed35a31-7d6f-11e3-bf68-5404a6144203',
            name: 'Makeup and cosmetics',
          },
        ],
      },
      id: '9ed35a2e-7d6f-11e3-a5cf-5404a6144203',
      name: 'Beauty and fragrances',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed3a846-7d6f-11e3-8a79-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed3a84b-7d6f-11e3-8661-5404a6144203',
            name: 'Maintenance and repair services',
          },
          {
            id: '9ed3a84e-7d6f-11e3-87df-5404a6144203',
            name: 'Online gaming',
          },
          {
            id: '9ed3a851-7d6f-11e3-92a4-5404a6144203',
            name: 'Software',
          },
          {
            id: '9ed3a84c-7d6f-11e3-9a6e-5404a6144203',
            name: 'Monitors and projectors',
          },
          {
            id: '9ed3a84d-7d6f-11e3-9eca-5404a6144203',
            name: 'Networking',
          },
          {
            id: '9ed3a853-7d6f-11e3-a35d-5404a6144203',
            name: 'Web hosting and design',
          },
          {
            id: '9ed3a852-7d6f-11e3-aba3-5404a6144203',
            name: 'Training services',
          },
          {
            id: '9ed3a850-7d6f-11e3-ad7d-5404a6144203',
            name: 'Peripherals',
          },
          {
            id: '9ed3a848-7d6f-11e3-af5a-5404a6144203',
            name: 'Desktops, laptops, and notebooks',
          },
          {
            id: '9ed3a84f-7d6f-11e3-b1a4-5404a6144203',
            name: 'Parts and accessories',
          },
          {
            id: '9ed3a84a-7d6f-11e3-b682-5404a6144203',
            name: 'eCommerce services',
          },
          {
            id: '9ed3a847-7d6f-11e3-b813-5404a6144203',
            name: 'Computer and data processing services',
          },
        ],
      },
      id: '9ed3a846-7d6f-11e3-8a79-5404a6144203',
      name: 'Computers, accessories, and services',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed44496-7d6f-11e3-865d-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed44498-7d6f-11e3-87b4-5404a6144203',
            name: 'Department store',
          },
          {
            id: '9ed4449d-7d6f-11e3-9238-5404a6144203',
            name: 'Variety store',
          },
          {
            id: '9ed4449c-7d6f-11e3-9843-5404a6144203',
            name: 'Used and secondhand store',
          },
          {
            id: '9ed4449a-7d6f-11e3-a380-5404a6144203',
            name: 'Miscellaneous store retailer',
          },
          {
            id: '9ed44499-7d6f-11e3-aa99-5404a6144203',
            name: 'Discount store',
          },
        ],
      },
      id: '9ed44496-7d6f-11e3-865d-5404a6144203',
      name: 'Retail',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed492bc-7d6f-11e3-9a1b-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed492bf-7d6f-11e3-87d7-5404a6144203',
            name: 'Hobby, toy, and game shops',
          },
          {
            id: '9ed492c3-7d6f-11e3-96a8-5404a6144203',
            name: 'Stationery, printing, and writing paper',
          },
          {
            id: '9ed492c4-7d6f-11e3-9f0c-5404a6144203',
            name: 'Vintage and collectibles',
          },
          {
            id: '9ed492c5-7d6f-11e3-9fe5-5404a6144203',
            name: 'Video games and systems',
          },
          {
            id: '9ed492bd-7d6f-11e3-ab0a-5404a6144203',
            name: 'Arts and crafts',
          },
          {
            id: '9ed492c0-7d6f-11e3-b1b2-5404a6144203',
            name: 'Memorabilia',
          },
          {
            id: '9ed492c2-7d6f-11e3-b58e-5404a6144203',
            name: 'Stamp and coin',
          },
          {
            id: '9ed492c1-7d6f-11e3-b5a1-5404a6144203',
            name: 'Music store - instruments and sheet music',
          },
          {
            id: '9ed492be-7d6f-11e3-bf01-5404a6144203',
            name: 'Camera and photographic supplies',
          },
        ],
      },
      id: '9ed492bc-7d6f-11e3-9a1b-5404a6144203',
      name: 'Toys and hobbies',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed4448d-7d6f-11e3-aab2-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed4448f-7d6f-11e3-8817-5404a6144203',
            name: 'Pet shops, pet food, and supplies',
          },
          {
            id: '9ed44491-7d6f-11e3-a152-5404a6144203',
            name: 'Veterinary services',
          },
          {
            id: '9ed4448e-7d6f-11e3-b343-5404a6144203',
            name: 'Medication and supplements',
          },
          {
            id: '9ed44490-7d6f-11e3-bfda-5404a6144203',
            name: 'Specialty and rare pets',
          },
        ],
      },
      id: '9ed4448d-7d6f-11e3-aab2-5404a6144203',
      name: 'Pets and animals',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed3a854-7d6f-11e3-a193-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed3a85a-7d6f-11e3-889a-5404a6144203',
            name: 'Vocational and trade schools',
          },
          {
            id: '9ed3a855-7d6f-11e3-8d29-5404a6144203',
            name: 'Business and secretarial schools',
          },
          {
            id: '9ed3a856-7d6f-11e3-962b-5404a6144203',
            name: 'Child care services',
          },
          {
            id: '9ed3a858-7d6f-11e3-9d57-5404a6144203',
            name: 'Dance halls, studios, and school',
          },
          {
            id: '9ed3a857-7d6f-11e3-b6c2-5404a6144203',
            name: 'Colleges and universities',
          },
          {
            id: '9ed3a859-7d6f-11e3-bcbb-5404a6144203',
            name: 'Elementary and secondary schools',
          },
        ],
      },
      id: '9ed3a854-7d6f-11e3-a193-5404a6144203',
      name: 'Education',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed248ae-7d6f-11e3-ba6e-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed35a26-7d6f-11e3-890f-5404a6144203',
            name: 'Stamp and coin',
          },
          {
            id: '9ed35a22-7d6f-11e3-9b52-5404a6144203',
            name: 'Digital art',
          },
          {
            id: '9ed35a25-7d6f-11e3-a03c-5404a6144203',
            name: 'Sewing, needlework, and fabrics',
          },
          {
            id: '9ed35a21-7d6f-11e3-a35c-5404a6144203',
            name: 'Camera and photographic supplies',
          },
          {
            id: '9ed35a1e-7d6f-11e3-a517-5404a6144203',
            name: 'Antiques',
          },
          {
            id: '9ed35a27-7d6f-11e3-aa1b-5404a6144203',
            name: 'Stationery, printing and writing paper',
          },
          {
            id: '9ed35a20-7d6f-11e3-ac6a-5404a6144203',
            name: 'Art dealers and galleries',
          },
          {
            id: '9ed35a23-7d6f-11e3-b222-5404a6144203',
            name: 'Memorabilia',
          },
          {
            id: '9ed35a24-7d6f-11e3-b2a3-5404a6144203',
            name: 'Music store - instruments and sheet music',
          },
          {
            id: '9ed35a1f-7d6f-11e3-ba72-5404a6144203',
            name: 'Art and craft supplies',
          },
          {
            id: '9ed35a28-7d6f-11e3-bdec-5404a6144203',
            name: 'Vintage and collectibles',
          },
        ],
      },
      id: '9ed248ae-7d6f-11e3-ba6e-5404a6144203',
      name: 'Arts, crafts, and collectibles',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed3cf5f-7d6f-11e3-8af8-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed3f663-7d6f-11e3-8a12-5404a6144203',
            name: 'Prepaid and stored value cards',
          },
          {
            id: '9ed3cf68-7d6f-11e3-8abb-5404a6144203',
            name: 'Credit union',
          },
          {
            id: '9ed3f667-7d6f-11e3-996b-5404a6144203',
            name: 'Security brokers and dealers',
          },
          {
            id: '9ed3f665-7d6f-11e3-99f4-5404a6144203',
            name: 'Remittance',
          },
          {
            id: '9ed3f666-7d6f-11e3-9a8d-5404a6144203',
            name: 'Rental property management',
          },
          {
            id: '9ed3cf69-7d6f-11e3-9dfb-5404a6144203',
            name: 'Investment banking and securities dealing',
          },
          {
            id: '9ed3f664-7d6f-11e3-9eaa-5404a6144203',
            name: 'Real estate agent',
          },
          {
            id: '9ed3cf6b-7d6f-11e3-a38f-5404a6144203',
            name: 'Sales financing',
          },
          {
            id: '9ed3cf67-7d6f-11e3-a43e-5404a6144203',
            name: 'Debt counseling service',
          },
          {
            id: '9ed3cf61-7d6f-11e3-a622-5404a6144203',
            name: 'Collection agency',
          },
          {
            id: '9ed3cf65-7d6f-11e3-a76a-5404a6144203',
            name: 'Securities and commodity exchanges',
          },
          {
            id: '9ed3cf6e-7d6f-11e3-a77e-5404a6144203',
            name: 'Financial and investment advice',
          },
          {
            id: '9ed3cf60-7d6f-11e3-a80d-5404a6144203',
            name: 'Accounting',
          },
          {
            id: '9ed3cf6a-7d6f-11e3-a898-5404a6144203',
            name: 'Escrow',
          },
          {
            id: '9ed3cf75-7d6f-11e3-aa5a-5404a6144203',
            name: 'Mortgage brokers and dealers',
          },
          {
            id: '9ed3cf74-7d6f-11e3-ac83-5404a6144203',
            name:
              'Financial transactions processing, reserve, and clearinghouse activities',
          },
          {
            id: '9ed3f662-7d6f-11e3-ad1d-5404a6144203',
            name: 'Paycheck lender and cash advance',
          },
          {
            id: '9ed3cf70-7d6f-11e3-afb0-5404a6144203',
            name: 'Insurance - life and annuity',
          },
          {
            id: '9ed3cf73-7d6f-11e3-b045-5404a6144203',
            name: 'Other activities related to credit intermediation',
          },
          {
            id: '9ed3f661-7d6f-11e3-b15e-5404a6144203',
            name: 'Online gaming currency',
          },
          {
            id: '9ed3cf62-7d6f-11e3-b2cd-5404a6144203',
            name: 'Commodity contracts dealing',
          },
          {
            id: '9ed3cf64-7d6f-11e3-b326-5404a6144203',
            name: 'Commodity contracts brokerage',
          },
          {
            id: '9ed3cf72-7d6f-11e3-b387-5404a6144203',
            name: 'Other investment pools and funds',
          },
          {
            id: '9ed3cf63-7d6f-11e3-b50c-5404a6144203',
            name: 'Miscellaneous financial investment activities',
          },
          {
            id: '9ed3f668-7d6f-11e3-b821-5404a6144203',
            name: 'Wire transfer and money order',
          },
          {
            id: '9ed3cf6c-7d6f-11e3-ba14-5404a6144203',
            name: 'Consumer lending',
          },
          {
            id: '9ed3cf66-7d6f-11e3-bc6c-5404a6144203',
            name: 'Credit bureaus',
          },
          {
            id: '9ed3cf6f-7d6f-11e3-bc97-5404a6144203',
            name: 'Insurance - auto and home',
          },
          {
            id: '9ed3cf6d-7d6f-11e3-bd75-5404a6144203',
            name: 'Offices of other holding companies',
          },
          {
            id: '9ed3cf71-7d6f-11e3-bf7b-5404a6144203',
            name: 'Other financial investment activities',
          },
          {
            id: '53ff176e-f832-4db3-89f4-d8f7044184c7',
            name: 'Commercial Banking',
          },
        ],
      },
      id: '9ed3cf5f-7d6f-11e3-8af8-5404a6144203',
      name: 'Financial services and products',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed3f67d-7d6f-11e3-bf40-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed3f683-7d6f-11e3-8a57-5404a6144203',
            name: 'Administration of economic programs',
          },
          {
            id: '9ed3f682-7d6f-11e3-925c-5404a6144203',
            name:
              'Administration of housing programs, urban planning, and community development',
          },
          {
            id: '9ed3f680-7d6f-11e3-945b-5404a6144203',
            name: 'Administration of human resource programs',
          },
          {
            id: '9ed3f681-7d6f-11e3-99ff-5404a6144203',
            name: 'Administration and environmental quality programs',
          },
          {
            id: '9ed3f67f-7d6f-11e3-a83d-5404a6144203',
            name: 'Justice, public order, and safety activities',
          },
          {
            id: '9ed3f67e-7d6f-11e3-b5c9-5404a6144203',
            name:
              'Executive, legislative, and other general government support',
          },
          {
            id: '9ed3f684-7d6f-11e3-b716-5404a6144203',
            name: 'Space research and technology',
          },
          {
            id: '9ed3f685-7d6f-11e3-ba5b-5404a6144203',
            name: 'National security and international affairs',
          },
        ],
      },
      id: '9ed3f67d-7d6f-11e3-bf40-5404a6144203',
      name: 'Government',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed4b9bc-7d6f-11e3-9133-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed4b9c5-7d6f-11e3-8b92-5404a6144203',
            name: 'Vintage and collectibles',
          },
          {
            id: '9ed4b9c0-7d6f-11e3-9035-5404a6144203',
            name: 'Boat dealer',
          },
          {
            id: '9ed4b9c2-7d6f-11e3-9147-5404a6144203',
            name: 'Motorcycle dealer',
          },
          {
            id: '9ed4b9c4-7d6f-11e3-97b9-5404a6144203',
            name: 'Recreational vehicle dealer',
          },
          {
            id: '9ed4b9c1-7d6f-11e3-99a2-5404a6144203',
            name: 'Mobile home dealer',
          },
          {
            id: '9ed4b9be-7d6f-11e3-a3eb-5404a6144203',
            name: 'Auto dealer - used only',
          },
          {
            id: '9ed4b9bf-7d6f-11e3-ad02-5404a6144203',
            name: 'Aviation',
          },
          {
            id: '9ed4b9c3-7d6f-11e3-ba27-5404a6144203',
            name: 'Recreational and utility trailer dealer',
          },
          {
            id: '9ed4b9bd-7d6f-11e3-bb61-5404a6144203',
            name: 'Auto dealer - new and used',
          },
        ],
      },
      id: '9ed4b9bc-7d6f-11e3-9133-5404a6144203',
      name: 'Vehicle sales',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed44486-7d6f-11e3-89f8-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed4448c-7d6f-11e3-8ce5-5404a6144203',
            name: 'Educational',
          },
          {
            id: '9ed44487-7d6f-11e3-9419-5404a6144203',
            name: 'Charity',
          },
          {
            id: '9ed44488-7d6f-11e3-9872-5404a6144203',
            name: 'Political',
          },
          {
            id: '9ed44489-7d6f-11e3-a09e-5404a6144203',
            name: 'Religious',
          },
          {
            id: '9ed4448a-7d6f-11e3-a496-5404a6144203',
            name: 'Other',
          },
          {
            id: '9ed4448b-7d6f-11e3-be19-5404a6144203',
            name: 'Personal',
          },
        ],
      },
      id: '9ed44486-7d6f-11e3-89f8-5404a6144203',
      name: 'Nonprofit',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed4b9c6-7d6f-11e3-a156-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed4b9c9-7d6f-11e3-8d35-5404a6144203',
            name: 'Audio and video',
          },
          {
            id: '9ed4b9d2-7d6f-11e3-90bc-5404a6144203',
            name: 'Towing service',
          },
          {
            id: '9ed4b9cc-7d6f-11e3-940b-5404a6144203',
            name: 'Auto service',
          },
          {
            id: '9ed4b9ce-7d6f-11e3-95d6-5404a6144203',
            name: 'Boat rental and leases',
          },
          {
            id: '9ed4b9d1-7d6f-11e3-9894-5404a6144203',
            name: 'Tools and equipment',
          },
          {
            id: '9ed4b9cf-7d6f-11e3-a74e-5404a6144203',
            name: 'Car wash',
          },
          {
            id: '9ed4b9d0-7d6f-11e3-a967-5404a6144203',
            name: 'Motorhome and recreational vehicle rental',
          },
          {
            id: '9ed4b9d3-7d6f-11e3-ad63-5404a6144203',
            name: 'Truck and utility trailer rental',
          },
          {
            id: '9ed4b9d4-7d6f-11e3-aeef-5404a6144203',
            name: 'Parts, supplies, and accessories',
          },
          {
            id: '9ed4b9ca-7d6f-11e3-af09-5404a6144203',
            name: 'Auto body repair and paint',
          },
          {
            id: '9ed4b9cd-7d6f-11e3-b533-5404a6144203',
            name: 'Automotive tire supply and service',
          },
          {
            id: '9ed4b9cb-7d6f-11e3-b5bb-5404a6144203',
            name: 'Auto rental',
          },
        ],
      },
      id: '9ed4b9c6-7d6f-11e3-a156-5404a6144203',
      name: 'Vehicle service and accessories',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed3a85b-7d6f-11e3-8995-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed3a85f-7d6f-11e3-8e3b-5404a6144203',
            name: 'General electronic accessories',
          },
          {
            id: '9ed3a85e-7d6f-11e3-9379-5404a6144203',
            name: 'Cell phones, PDAs, and pagers',
          },
          {
            id: '9ed3a85d-7d6f-11e3-9b4f-5404a6144203',
            name: 'Car audio and electronics',
          },
          {
            id: '9ed3a863-7d6f-11e3-9f20-5404a6144203',
            name: 'Telecommunication equipment and sales',
          },
          {
            id: '9ed3a865-7d6f-11e3-a3d0-5404a6144203',
            name: 'Telephone cards',
          },
          {
            id: '9ed3a861-7d6f-11e3-a572-5404a6144203',
            name: 'Home electronics',
          },
          {
            id: '9ed3a85c-7d6f-11e3-af39-5404a6144203',
            name: 'Cameras, camcorders and equipment',
          },
          {
            id: '9ed3a862-7d6f-11e3-b65b-5404a6144203',
            name: 'Investigation and security services',
          },
          {
            id: '9ed3a864-7d6f-11e3-bcd4-5404a6144203',
            name: 'Telecommunication services',
          },
          {
            id: '9ed3a860-7d6f-11e3-befb-5404a6144203',
            name: 'Home audio',
          },
        ],
      },
      id: '9ed3a85b-7d6f-11e3-8995-5404a6144203',
      name: 'Electronics and telecom',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed35a32-7d6f-11e3-9830-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed35a3a-7d6f-11e3-9579-5404a6144203',
            name: 'Rare and used books',
          },
          {
            id: '9ed35a39-7d6f-11e3-96ad-5404a6144203',
            name: 'Printing',
          },
          {
            id: '9ed35a37-7d6f-11e3-a05d-5404a6144203',
            name: 'Magazines',
          },
          {
            id: '9ed35a38-7d6f-11e3-a24f-5404a6144203',
            name: 'Publishing',
          },
          {
            id: '9ed35a35-7d6f-11e3-a469-5404a6144203',
            name: 'Book store',
          },
          {
            id: '9ed35a33-7d6f-11e3-ba85-5404a6144203',
            name: 'Audio books',
          },
        ],
      },
      id: '9ed35a32-7d6f-11e3-9830-5404a6144203',
      name: 'Books and magazines',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed44492-7d6f-11e3-98d1-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed44493-7d6f-11e3-9b4f-5404a6144203',
            name: 'Membership services',
          },
          {
            id: '9ed44495-7d6f-11e3-b2f6-5404a6144203',
            name: 'Services not elsewhere classified',
          },
        ],
      },
      id: '9ed44492-7d6f-11e3-98d1-5404a6144203',
      name: 'Religion and spirituality (for profit)',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed492ac-7d6f-11e3-a2d2-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed492b1-7d6f-11e3-a276-5404a6144203',
            name: 'Dance halls, studios, and schools',
          },
          {
            id: '9ed492b9-7d6f-11e3-a5ed-5404a6144203',
            name: 'Other sporting goods',
          },
          {
            id: '9ed492ba-7d6f-11e3-ab20-5404a6144203',
            name: 'Firearms, knives, and martial arts weapons',
          },
          {
            id: '9ed492bb-7d6f-11e3-b634-5404a6144203',
            name: 'Swimming pools and spas',
          },
          {
            id: '9ed492b3-7d6f-11e3-bbca-5404a6144203',
            name: 'Fan gear and memorabilia',
          },
        ],
      },
      id: '9ed492ac-7d6f-11e3-a2d2-5404a6144203',
      name: 'Sports and outdoors',
    },
    {
      _links: {
        self: {
          href:
            'https://api.dwolla.com/business-classifications/9ed3f677-7d6f-11e3-96a2-5404a6144203',
          type: 'application/vnd.dwolla.v1.hal+json',
          'resource-type': 'business-classification',
        },
      },
      _embedded: {
        'industry-classifications': [
          {
            id: '9ed3f679-7d6f-11e3-a884-5404a6144203',
            name: 'Gift, card, novelty, and souvenir shops',
          },
          {
            id: '9ed3f67b-7d6f-11e3-aead-5404a6144203',
            name: 'Nursery plants and flowers',
          },
          {
            id: '9ed3f67c-7d6f-11e3-b1fb-5404a6144203',
            name: 'Party supplies',
          },
          {
            id: '9ed3f678-7d6f-11e3-b609-5404a6144203',
            name: 'Florist',
          },
          {
            id: '9ed3f67a-7d6f-11e3-bb5b-5404a6144203',
            name: 'Gourmet foods',
          },
        ],
      },
      id: '9ed3f677-7d6f-11e3-96a2-5404a6144203',
      name: 'Gifts and flowers',
    },
  ]

  get rules() {
    return {
      firstName: [exists('First name required')],
      lastName: [exists('Last name required')],
      phone: [exists('Phone number required')],
      email: emailRules,
      password: passwordRules,
      passwordMatches,
      confirmPassword: [exists('Password confirmation required')],
      businessName: [exists('Business name required')],
      businessType: [exists('Business type required')],
      address1: [exists('Address 1 required')],
      city: [exists('City required')],
      state: [exists('State or province required')],
      country: [exists('Country required')],
      postalCode: postalCodeRules,
      postalCodeInternational: [exists('Postal code required')],
      businessClassificationCategory: [exists('Category required')],
      businessClassification: [exists('Business classification required')],
      ein: einRules,
      title: [exists('Title required')],
      passportNum: [exists('Passport number required')],
    }
  }

  @Prop({ default: false }) isValid!: boolean

  @Watch('form')
  @Watch('form.controller')
  onFormChange() {
    const form = this.form

    if (this.isCompanyController && form && form?.controller) {

      form.controller.firstName = form.firstName
      form.controller.lastName = form.lastName
    }

    this.$emit('update', form)
  }

  @Watch('form.controller.address.country')
  onCountryChanged() {
    if (this.form.controller)
      this.form.controller.passport.country = this.form.controller.address.country
  }

  get classifications() {
    return this.businessClassifications.map((classification: any) => {
      return classification.name
    })
  }

  getIndustries(classificationName: string) {
    return this.businessClassifications.find((classification: any) => {
      return classification.name === classificationName
    })?._embedded['industry-classifications']
  }
}
</script>

<style lang="scss">
  .hide-arrow-buttons {
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* Firefox */
    input[type=number] {
      -moz-appearance: textfield;
    }
  }
</style>